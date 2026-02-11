import os
from openai import AsyncOpenAI
from langdetect import detect
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def summarize_text(text: str) -> str:
    """
    Detects language, then summarizes T&C text in English.
    """
    lang = "en"
    try:
        lang = detect(text)
    except:
        pass

    prompt = (
        f"The following Terms and Conditions are written in {lang}. "
        f"Translate them into English only if they are not already written in {lang}, then summarize them into concise, factual bullet points, "
        f"keeping legal meaning accurate and clear. keep the number of bullet points under 10, preferably use less if you can and focus on the most important points.\n\n"
        f"{text}"
    )

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()

def compare_with_gpt(old_summary: str, new_summary: str) -> str:
    """
    Uses GPT to semantically compare two T&C summaries
    and highlight key additions, removals, or modifications.
    """
    prompt = f"""
You are a legal-text comparison assistant.
Compare the two versions of Terms & Conditions summaries below.

OLD SUMMARY:
{old_summary}

NEW SUMMARY:
{new_summary}

Write a concise, human-readable diff:
• Highlight **added**, **removed**, and **modified** points.
• Focus on meaningful legal or privacy-related changes.
• Use bullet points and keep it under 10 items.
• If differences are minor or stylistic, say "No significant policy changes."
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()

