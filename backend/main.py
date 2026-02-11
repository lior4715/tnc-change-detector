from fastapi import FastAPI
from pydantic import BaseModel
from services.summarizer import summarize_text, compare_with_gpt
from fastapi.middleware.cors import CORSMiddleware
from difflib import unified_diff

app = FastAPI()

# Allow React/extension to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeRequest(BaseModel):
    domain: str
    text: str

@app.get("/")
def root():
    return {"message": "Backend is running!"}

@app.post("/api/summarize")
async def summarize(req: SummarizeRequest):
    summary = await summarize_text(req.text)
    return {"domain": req.domain, "summary": summary}

@app.post("/api/compare")
async def compare(req: SummarizeRequest):
    new_summary = await summarize_text(req.text)
    return {"domain": req.domain, "summary": new_summary}
