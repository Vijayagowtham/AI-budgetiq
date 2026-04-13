import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "budgetiq-jwt-super-secret-2026")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print(
            "WARNING: SUPABASE_URL / SUPABASE_KEY not set in environment. "
            "The server will crash on first DB call. "
            "Please populate backend/.env with your Supabase credentials."
        )

    if not GEMINI_API_KEY:
        print(
            "WARNING: GEMINI_API_KEY not set in environment. "
            "The AI chatbot will operate in fallback mode."
        )
