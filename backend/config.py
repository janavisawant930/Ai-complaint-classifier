import os
from pathlib import Path
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv

# Search and load .env from backend directory or project root
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent

env_backend = backend_dir / ".env"
env_root = root_dir / ".env"

if env_backend.exists():
    load_dotenv(dotenv_path=env_backend, override=True)
elif env_root.exists():
    load_dotenv(dotenv_path=env_root, override=True)
else:
    load_dotenv(override=True)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "complain_ai_secret_key_2026")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"

    # Database settings with cloud URL and local fallback support
    _db_url = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL")
    if _db_url:
        try:
            _parsed_url = urlparse(_db_url)
            DB_HOST = _parsed_url.hostname or "localhost"
            DB_PORT = int(_parsed_url.port or 3306)
            DB_USER = unquote(_parsed_url.username) if _parsed_url.username else "root"
            DB_PASSWORD = unquote(_parsed_url.password) if _parsed_url.password is not None else ""
            DB_NAME = _parsed_url.path.lstrip("/") if _parsed_url.path else "complaint_db"
        except Exception:
            DB_HOST = os.getenv("DB_HOST") or os.getenv("MYSQL_HOST") or "localhost"
            DB_PORT = int(os.getenv("DB_PORT") or os.getenv("MYSQL_PORT") or 3306)
            DB_USER = os.getenv("DB_USER") or os.getenv("MYSQL_USER") or "root"
            _raw_pw = os.getenv("DB_PASSWORD")
            if _raw_pw is None:
                _raw_pw = os.getenv("MYSQL_PASSWORD")
            if _raw_pw is None:
                _raw_pw = os.getenv("MYSQL_ROOT_PASSWORD")
            DB_PASSWORD = _raw_pw if _raw_pw is not None else ""
            DB_NAME = os.getenv("DB_NAME") or os.getenv("MYSQL_DATABASE") or "complaint_db"
    else:
        DB_HOST = os.getenv("DB_HOST") or os.getenv("MYSQL_HOST") or "localhost"
        DB_PORT = int(os.getenv("DB_PORT") or os.getenv("MYSQL_PORT") or 3306)
        DB_USER = os.getenv("DB_USER") or os.getenv("MYSQL_USER") or "root"
        
        # Read password safely from environment variable (handles empty string vs None)
        _raw_pw = os.getenv("DB_PASSWORD")
        if _raw_pw is None:
            _raw_pw = os.getenv("MYSQL_PASSWORD")
        if _raw_pw is None:
            _raw_pw = os.getenv("MYSQL_ROOT_PASSWORD")
        DB_PASSWORD = _raw_pw if _raw_pw is not None else ""

        DB_NAME = os.getenv("DB_NAME") or os.getenv("MYSQL_DATABASE") or "complaint_db"

    # CORS settings
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # LangChain & Gemini RAG settings
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("AIP_KEY") or ""
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")
    KNOWLEDGE_BASE_DIR = os.getenv("KNOWLEDGE_BASE_DIR", str(backend_dir / "knowledge_base"))
    CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", str(backend_dir / "chroma_db"))

