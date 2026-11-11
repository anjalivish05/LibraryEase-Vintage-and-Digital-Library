import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

logger = logging.getLogger("libraryease.database")

Base = declarative_base()
ACTIVE_DB_TYPE = "sqlite"

def init_engine():
    global ACTIVE_DB_TYPE
    db_url = settings.DATABASE_URL

    # 1. Supabase / PostgreSQL in Production
    if db_url and ("postgres" in db_url.lower()):
        try:
            print("[Database] Connecting to production PostgreSQL database...")
            # Normalize driver schema to psycopg2 if unspecified
            normalized_pg_url = db_url
            if normalized_pg_url.startswith("postgres://"):
                normalized_pg_url = normalized_pg_url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif normalized_pg_url.startswith("postgresql://"):
                normalized_pg_url = normalized_pg_url.replace("postgresql://", "postgresql+psycopg2://", 1)

            # For Supabase Free tier: pool_pre_ping=True prevents stale sockets after Render sleep
            # pool_size=5, max_overflow=10 is well within Supabase Free 60-connection pool limit
            pg_engine = create_engine(
                normalized_pg_url,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=5,
                max_overflow=10,
                connect_args={"connect_timeout": 10}
            )
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[Database SUCCESS] Connected to PostgreSQL database successfully!")
            ACTIVE_DB_TYPE = "postgresql"
            return pg_engine
        except Exception as e:
            error_msg = (
                f"[Database FATAL] Configured production PostgreSQL connection failed: {e}\n"
                f"Halting backend startup to prevent accidental fallback to ephemeral SQLite storage in production.\n"
                f"Please verify DATABASE_URL in your environment variables, check Supabase credentials, and ensure the database is accessible."
            )
            logger.critical(error_msg)
            print(error_msg)
            raise RuntimeError(error_msg) from e

    # 2. MySQL (if explicitly configured via DATABASE_URL)
    elif db_url and ("mysql" in db_url.lower()):
        try:
            print(f"[Database] Connecting to MySQL database at {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}...")
            mysql_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 5}
            )
            with mysql_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[Database SUCCESS] Connected to MySQL database '{settings.DB_NAME}' successfully!")
            ACTIVE_DB_TYPE = "mysql"
            return mysql_engine
        except Exception as e:
            print(f"[Database Notice] MySQL connection failed ({e}).")
            print(f"[Database Fallback] Falling back to SQLite engine ({settings.SQLITE_URL}) so backend starts immediately.")

    # 3. Resilient Local SQLite Development (Default when DATABASE_URL is not set)
    ACTIVE_DB_TYPE = "sqlite"
    sqlite_engine = create_engine(
        settings.SQLITE_URL,
        connect_args={"check_same_thread": False}
    )

    # Enable SQLite foreign key constraints
    @event.listens_for(sqlite_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    print(f"[Database] Using SQLite engine ({settings.SQLITE_URL}) - All tables and features operational.")
    return sqlite_engine

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
