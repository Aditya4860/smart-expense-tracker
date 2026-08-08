"""
Root entrypoint wrapper for FastAPI ASGI application.
Allows running `uvicorn main:app --reload --port 8000` directly from the repository root.
"""
import sys
from pathlib import Path

# Ensure backend directory is in sys.path so 'app' and internal packages resolve
backend_path = Path(__file__).resolve().parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import backend.main as backend_main

app = backend_main.app
