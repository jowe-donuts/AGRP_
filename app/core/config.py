"""Application configuration via pydantic Settings.

All values are read from environment variables – sensible defaults are provided for local
development. In production you should supply a proper .env file or set the vars in the
deployment platform.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=False,
        env_file=".env",
        env_file_encoding="utf-8",
        validate_by_name=True,
    )

    # FastAPI secret key for CSRF‑like features (not used for JWT)
    secret_key: str = Field(default="change-me", validation_alias="SECRET_KEY")

    # Database URL – SQLite for local development
    database_url: str = Field(
        default="sqlite:///./agp.db",
        validation_alias="DATABASE_URL",
    )

    # JWT configuration (mirrors app.core.security defaults)
    jwt_secret_key: str = Field(default="change-me-in-prod", validation_alias="JWT_SECRET_KEY")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = Field(
        default=60,
        validation_alias="JWT_ACCESS_EXPIRE_MINUTES",
    )

    # Cloud storage (e.g., AWS S3) – placeholder values
    cloud_storage_endpoint: str = Field(default="", validation_alias="CLOUD_STORAGE_ENDPOINT")
    cloud_storage_bucket: str = Field(default="", validation_alias="CLOUD_STORAGE_BUCKET")
    cloud_storage_access_key: str = Field(default="", validation_alias="CLOUD_STORAGE_ACCESS_KEY")
    cloud_storage_secret_key: str = Field(default="", validation_alias="CLOUD_STORAGE_SECRET_KEY")

    # Redis (Celery) configuration
    celery_broker_url: str = Field(
        default="redis://localhost:6379/0",
        validation_alias="CELERY_BROKER_URL",
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379/1",
        validation_alias="CELERY_RESULT_BACKEND",
    )


# Export a singleton for easy import throughout the codebase
settings = Settings()
