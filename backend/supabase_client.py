
from supabase import create_client
from dotenv import load_dotenv
from pathlib import Path
import os



#read the .env file and get the url and key 
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")


supabase_client = create_client(url, key)
