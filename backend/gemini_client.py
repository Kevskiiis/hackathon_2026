
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pathlib import Path
import os

#read the .env file and get the key 
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

client = genai.Client(api_key = os.getenv("GEMINI_API_KEY"))