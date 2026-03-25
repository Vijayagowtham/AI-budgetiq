import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-for-dev")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("INFO: Supabase credentials missing. Using local SQLite database.")
