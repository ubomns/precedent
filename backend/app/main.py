import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import generate, export

# Load environment variables from .env file
# Try multiple paths for robustness
current_file = Path(__file__).resolve()
env_paths = [
    current_file.parent.parent / ".env",
    Path(".env").resolve(),
    Path(os.getcwd()) / ".env",
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"[ENV] Loaded .env from: {env_path}")
        break
else:
    print("[ENV] No .env file found!")

print(f"[ENV] OPENAI_API_KEY present: {'YES' if os.getenv('OPENAI_API_KEY') else 'NO'}")

app = FastAPI(title="Precedent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(export.router, prefix="/api", tags=["export"])

@app.get("/")
async def root():
    return {"message": "Precedent API is running."}
