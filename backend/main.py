import time
import json
import traceback
import re
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from app.core.config import settings
from app.api.v1 import api_router
from app.core.exceptions import BaseAPIException
from app.core.logging import logger

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Hardened CORS Configuration
allowed_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS]
if not allowed_origins:
    # Safe local development defaults
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
    expose_headers=["Content-Length", "Retry-After"],
)

# Security Headers & Request Sanitization Middleware
@app.middleware("http")
async def security_headers_and_logging_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Redact sensitive parameters from request URL logging
    raw_path = request.url.path
    query_str = str(request.query_params)
    if query_str:
        # Mask sensitive query params
        query_str = re.sub(r"(token|secret|password|key)=[^&]+", r"\1=[REDACTED]", query_str, flags=re.IGNORECASE)
        log_url = f"{raw_path}?{query_str}"
    else:
        log_url = raw_path

    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        
        # Inject standard security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "0"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        # Request performance logging
        if process_time > 500:
            logger.warning(
                f"SLOW REQUEST: METHOD={request.method} PATH={log_url} "
                f"STATUS={response.status_code} TIME={process_time:.2f}ms"
            )
        else:
            logger.info(
                f"METHOD={request.method} PATH={log_url} "
                f"STATUS={response.status_code} TIME={process_time:.2f}ms"
            )
        
        # Do not wrap 204 No Content or documentation endpoints
        if response.status_code == 204 or request.url.path.startswith(("/docs", "/redoc", "/openapi.json")):
            return response

        # Wrap successful JSON responses consistently
        content_type = response.headers.get("content-type", "")
        if response.status_code < 400 and "application/json" in content_type:
            body = b""
            async for chunk in response.body_iterator:
                body += chunk
            try:
                data = json.loads(body)
                if isinstance(data, dict) and "success" in data and "data" in data:
                    wrapped = data
                else:
                    wrapped = {
                        "success": True,
                        "message": "Operation successful",
                        "data": data
                    }
                wrapped_body = json.dumps(wrapped).encode("utf-8")
                
                headers = dict(response.headers)
                headers.pop("content-length", None)
                
                return Response(
                    content=wrapped_body,
                    status_code=response.status_code,
                    headers=headers,
                    media_type="application/json"
                )
            except json.JSONDecodeError:
                return Response(
                    content=body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type="application/json"
                )

        return response

    except Exception as exc:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            f"ERROR REQUEST: METHOD={request.method} PATH={log_url} "
            f"STATUS=500 TIME={process_time:.2f}ms"
        )
        raise exc


# Unified Global Exception Handlers

@app.exception_handler(BaseAPIException)
async def custom_http_exception_handler(request: Request, exc: BaseAPIException):
    logger.warning(f"API Exception ({exc.status_code}): {exc.detail}")
    headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        **(exc.headers or {})
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "errors": []},
        headers=headers
    )


@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP Exception ({exc.status_code}): {exc.detail}")
    headers = {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        **(exc.headers or {})
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": str(exc.detail), "errors": []},
        headers=headers
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()]
    logger.warning(f"Validation error on {request.url.path}: {len(errors)} errors")
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation Error", "errors": errors},
        headers={"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY"}
    )


@app.exception_handler(IntegrityError)
async def db_integrity_exception_handler(request: Request, exc: IntegrityError):
    # Log the full database error internally
    logger.error(f"Database Integrity Error on {request.url.path}: {str(exc.orig) if hasattr(exc, 'orig') else str(exc)}")
    # Hide table/column internal names from client
    return JSONResponse(
        status_code=409,
        content={"success": False, "message": "A database conflict or constraint violation occurred.", "errors": []},
        headers={"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY"}
    )


@app.exception_handler(SQLAlchemyError)
async def db_general_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"SQLAlchemy Database Error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "A database error occurred. Please try again later.", "errors": []},
        headers={"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY"}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}:")
    logger.error(traceback.format_exc())
    # Return generic message hiding all stack traces
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "An unexpected error occurred. Please try again later.", "errors": []},
        headers={"X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY"}
    )


# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health Check Endpoint
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "message": "Smart Expense Tracker Backend is healthy."}

