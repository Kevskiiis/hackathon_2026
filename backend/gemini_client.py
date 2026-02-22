
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path
import os

#read the .env file and get the key 
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash", # mlh website says this model is good for chat bots - https://gemini-hackathon-hub-614365371127.us-west1.run.app/
    tools = "google_search_retrieval" # this is for realtime web searching
) 