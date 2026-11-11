import os
import secrets
import logging
from typing import List
from pathlib import Path

logger = logging.getLogger(__name__)

try:
    from dotenv import load_dotenv
    # Load .env from backend directory
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

class Settings:
    # Optional individual database connection parameters
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", "3307"))
    DB_NAME: str = os.getenv("DB_NAME", "libraryease")
    
    # Production / Configured Database URL (Supabase PostgreSQL, remote PostgreSQL, or MySQL)
    @property
    def DATABASE_URL(self) -> str:
        """
        Loads DATABASE_URL from OS environment.
        Automatically normalizes legacy 'postgres://' schema to 'postgresql://' for SQLAlchemy 2.0+ compatibility.
        Returns empty string when unconfigured, allowing database.py to default cleanly to local SQLite.
        """
        raw_url = os.getenv("DATABASE_URL", "").strip()
        if raw_url:
            # SQLAlchemy 1.4+ / 2.0+ requires postgresql:// instead of postgres://
            if raw_url.startswith("postgres://"):
                return raw_url.replace("postgres://", "postgresql://", 1)
            return raw_url
        return ""
    
    # Fallback SQLite URL anchored to backend directory to prevent accidental empty databases
    # In Vercel serverless environments, root is read-only, so fallback to /tmp if not explicitly set
    if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        _default_sqlite_path = "/tmp/libraryease.db"
    else:
        _default_sqlite_path = (Path(__file__).resolve().parent / "libraryease.db").as_posix()
    SQLITE_URL: str = os.getenv("SQLITE_URL", f"sqlite:///{_default_sqlite_path}")
    
    # Security & JWT Authentication
    _runtime_jwt_secret: str = ""

    @property
    def JWT_SECRET(self) -> str:
        """
        Securely loads JWT_SECRET from environment variables or active .env file.
        If unconfigured in local development, generates a cryptographically strong
        random 256-bit secret so that zero secrets are hardcoded in source code.
        """
        # 1. Check OS environment variable
        env_secret = os.getenv("JWT_SECRET", "").strip()
        if env_secret:
            return env_secret
        
        # 2. Check local backend/.env file directly
        try:
            env_file = Path(__file__).resolve().parent / ".env"
            if env_file.exists():
                for line in env_file.read_text(encoding="utf-8").splitlines():
                    stripped = line.strip()
                    if stripped.startswith("JWT_SECRET="):
                        k = stripped.split("=", 1)[1].strip()
                        if k and not k.startswith("your_"):
                            return k
        except Exception:
            pass

        # 3. Development Fallback: Generate a strong random key for session
        if not self._runtime_jwt_secret:
            self._runtime_jwt_secret = secrets.token_hex(32)
            logger.info("Generated cryptographically strong development JWT secret for local session.")
        return self._runtime_jwt_secret

    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days

    # CORS Configuration
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """
        Returns allowed origins for CORS.
        Always includes verified local development origins. Additional production
        origins can be configured via the CORS_ORIGINS or ALLOWED_ORIGINS environment variable.
        Also automatically trusts Vercel preview and production domains if present.
        Wildcard '*' origins are strictly filtered out to prevent credential exposure.
        """
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
        
        # Automatically trust Vercel system domains if set
        for v_env in ["VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL"]:
            v = os.getenv(v_env, "").strip()
            if v:
                cleaned_v = f"https://{v.rstrip('/')}" if not v.startswith("http") else v.rstrip("/")
                if cleaned_v not in origins:
                    origins.append(cleaned_v)

        extra_origins = os.getenv("CORS_ORIGINS", os.getenv("ALLOWED_ORIGINS", "")).strip()
        if extra_origins:
            for item in extra_origins.split(","):
                cleaned = item.strip().rstrip("/")
                if cleaned and cleaned != "*" and cleaned not in origins:
                    origins.append(cleaned)
        return origins
    
    # AI Search & Metadata
    @property
    def GEMINI_API_KEY(self) -> str:
        # Check active os.environ first
        val = os.getenv("GEMINI_API_KEY", "")
        if val and val.strip():
            return val.strip()
        # Dynamically read backend/.env so keys added at runtime are immediately recognized
        try:
            env_file = Path(__file__).resolve().parent / ".env"
            if env_file.exists():
                for line in env_file.read_text(encoding="utf-8").splitlines():
                    stripped = line.strip()
                    if stripped.startswith("GEMINI_API_KEY="):
                        k = stripped.split("=", 1)[1].strip()
                        if k:
                            return k
        except Exception:
            pass
        return ""

    LIBRARY_NAME: str = os.getenv("LIBRARY_NAME", "LibraryEase Central Public Library")
    LIBRARY_TIMEZONE: str = os.getenv("LIBRARY_TIMEZONE", "Asia/Kolkata")
    
    # SMTP Settings (optional for real emails, simulated/logged by default)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL", "reminders@libraryease.org")

settings = Settings()
