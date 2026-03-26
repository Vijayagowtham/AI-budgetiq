import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-for-dev")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print(
            "WARNING: SUPABASE_URL / SUPABASE_KEY not set in environment. "
            "The server will crash on first DB call. "
            "Please populate backend/.env with your Supabase credentials."
        )
