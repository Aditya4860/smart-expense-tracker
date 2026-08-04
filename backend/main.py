from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1 import api_router
from app.core.exceptions import BaseAPIException
from app.core.logging import logger
import traceback
import time
import json

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Request Logging & Standardization Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        
        # Slow request warning threshold (> 500ms)
        if process_time > 500:
            logger.warning(
                f"SLOW REQUEST: METHOD={request.method} PATH={request.url.path} "
                f"STATUS={response.status_code} TIME={process_time:.2f}ms"
            )
        else:
            logger.info(
                f"METHOD={request.method} PATH={request.url.path} "
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
                
                from fastapi.responses import Response
                return Response(
                    content=wrapped_body,
                    status_code=response.status_code,
                    headers=headers,
                    media_type="application/json"
                )
            except json.JSONDecodeError:
                from fastapi.responses import Response
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
            f"METHOD={request.method} PATH={request.url.path} "
            f"STATUS=500 TIME={process_time:.2f}ms"
        )
        raise exc

# Global Exception Handlers
@app.exception_handler(BaseAPIException)
async def custom_http_exception_handler(request: Request, exc: BaseAPIException):
    logger.error(f"HTTP Exception: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "errors": []},
        headers=exc.headers
    )

from fastapi.exceptions import RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"loc": err["loc"], "msg": err["msg"], "type": err["type"]} for err in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation Error", "errors": errors},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception:")
    logger.error(traceback.format_exc())
    # Return JSONResponse instead of raising to ensure CORS headers apply
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal Server Error", "errors": []},
        headers={"Access-Control-Allow-Origin": "*"} if not settings.BACKEND_CORS_ORIGINS else None
    )

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health Check Endpoint
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "message": "Smart Expense Tracker Backend is healthy."}
