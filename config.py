import os
from pathlib import Path

# Database configuration
DB_PATH = Path(__file__).parent / "data" / "app_db.sqlite"
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# App configuration
APP_NAME = "XpertPredict"
APP_ICON = "🏢"
DEFAULT_THEME = "light"
APP_ENV = "dev" # dev|prod

# Security
SESSION_EXPIRE_MINUTES = 30
PASSWORD_HASH_ITERATIONS = 100000
ST_COOKIE_KEY = "9vOqkld19EgsQrKi3rhrHdL8FoHBY31nPUrMEssnULc="

API_BASE_URL = "http://127.0.0.1:8000/api/v1"
#API_BASE_URL = "https://visionapi.xpertcapture.com/api/v1"
#API_BASE_URL = "http://mychalan.com:8000/api/v1"