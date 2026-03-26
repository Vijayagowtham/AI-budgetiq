import os
from supabase import create_client, Client
from config import Config

_supabase_client: Client = None

def get_supabase() -> Client:
    """Return a lazily-initialised Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        url = Config.SUPABASE_URL
        key = Config.SUPABASE_KEY
        if not url or not key:
            raise RuntimeError(
                "SUPABASE_URL and SUPABASE_KEY must be set in your .env file. "
                "See backend/.env.example for guidance."
            )
        _supabase_client = create_client(url, key)
    return _supabase_client

# Backwards-compat alias (not actually used by routes any more)
supabase_client = None
