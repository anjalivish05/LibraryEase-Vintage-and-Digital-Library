import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    # Load .env from backend directory
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

class Settings:
    # MySQL Database Configuration
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_HOST: str = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT: int = int(os.getenv("DB_PORT", "3307"))  # Default local MySQL port
    DB_NAME: str = os.getenv("DB_NAME", "libraryease")
    
    # Constructed MySQL Database URL or explicit override from environment
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}@{os.getenv('DB_HOST', '127.0.0.1')}:{os.getenv('DB_PORT', '3307')}/{os.getenv('DB_NAME', 'libraryease')}"
    )
    
    # Fallback SQLite URL anchored to backend directory to prevent accidental empty databases
    _DB_FILE = (Path(__file__).resolve().parent / "libraryease.db").as_posix()
    SQLITE_URL: str = os.getenv("SQLITE_URL", f"sqlite:///{_DB_FILE}")
    
    # Security & JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "libraryease-super-secure-production-jwt-key-2026-xyz")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
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
