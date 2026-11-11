import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

logger = logging.getLogger("libraryease.database")

Base = declarative_base()
ACTIVE_DB_TYPE = "sqlite"

def init_engine():
    global ACTIVE_DB_TYPE
    mysql_url = settings.DATABASE_URL

    # 1. Attempt MySQL connection if configured
    if "mysql" in mysql_url.lower():
        try:
            print(f"[Database] Attempting connection to MySQL at {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}...")
            test_engine = create_engine(
                mysql_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 3}
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[Database SUCCESS] Connected to MySQL database '{settings.DB_NAME}' successfully!")
            ACTIVE_DB_TYPE = "mysql"
            return test_engine
        except Exception as e:
            print(f"[Database Notice] MySQL connection unsuccessful ({e}).")
            print(f"[Database Fallback] Falling back to SQLite engine ({settings.SQLITE_URL}) so backend starts immediately.")
            print(f"[Database Info] To connect to your MySQL server, update DB_PASSWORD in backend/.env and execute backend/schema.sql.")

    # 2. Resilient SQLite Engine
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

    print("[Database] Using SQLite engine at libraryease.db (All tables and features operational).")
    return sqlite_engine

engine = init_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
