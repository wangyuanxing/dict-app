import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "dictapp.db")}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    DEFAULT_PAGE_SIZE = 50
    LLM_MAX_TOKENS_PER_BATCH = 3000
    LLM_MAX_RETRIES = 3
    LLM_RETRY_BACKOFF = 2
