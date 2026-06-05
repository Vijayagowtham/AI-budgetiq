import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

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

    if not JWT_SECRET_KEY:
        raise RuntimeError(
            "CRITICAL: JWT_SECRET_KEY is not set in environment. "
            "Refusing to start in insecure mode. Please set JWT_SECRET_KEY."
        )
