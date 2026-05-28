import os
import uvicorn

# Ensure we're in the right directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Start uvicorn
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=False, log_level="info")
