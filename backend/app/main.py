from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api.v1.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("leadforge")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing LeadForge AI database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema ready.")
    yield
    engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    description="Private Agency Lead Generation & Business Intelligence Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["System"])
def root_index():
    return {
        "status": "online",
        "service": "LeadForge AI Backend API",
        "interactive_docs": "/docs",
        "openapi_spec": "/openapi.json",
        "frontend_ui": "http://localhost:3000",
        "message": "LeadForge AI API server is running smoothly! Visit http://localhost:3000 in your browser to open the UI."
    }

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "sqlite_sync" if "sqlite" in settings.DATABASE_URL else "postgresql",
        "ai_gateway": "OpenRouter",
        "discovery_engine": "OpenStreetMap Overpass (100% Free)"
    }
