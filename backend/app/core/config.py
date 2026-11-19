from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    APP_NAME: str = "LeadForge AI Core"
    DEBUG: bool = True
    PORT: int = 8000

    # Database (Default: Local SQLite, zero-config, 100% free)
    DATABASE_URL: str = "sqlite:///./leadforge.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        elif isinstance(v, list):
            return v
        return []

    # Google Gemini Direct API (Free at https://aistudio.google.com)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # OpenRouter AI Gateway (Single Unified AI Provider)
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_DEFAULT_MODEL: str = "google/gemini-2.0-flash-exp:free"
    OPENROUTER_FALLBACK_MODEL: str = "meta-llama/llama-3.2-3b-instruct:free"

    # Business Discovery
    GOOGLE_PLACES_API_KEY: str = ""

    # Crawler & Auditor Settings
    CRAWLER_USER_AGENT: str = "LeadForgeBot/1.0 (+https://leadforge.internal; agency-scanner)"
    CRAWLER_TIMEOUT_SECONDS: int = 10

    model_config = SettingsConfigDict(
        env_file=("backend/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
