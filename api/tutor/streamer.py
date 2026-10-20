import json
import asyncio
from typing import AsyncGenerator
from api.schemas.chat import ChatResponse


async def format_sse_stream(
    chat_response: ChatResponse,
    token_delay_sec: float = 0.02,
) -> AsyncGenerator[str, None]:
    """
    Formats a validated ChatResponse into Server-Sent Events (SSE).
    Emits progressive 'token' events followed by a structured 'final' event.
    """
    answer_text = chat_response.answer

    # 1. Progressive Token Streaming
    # Split by whitespace while preserving punctuation for natural cadence
    words = answer_text.split(" ")
    for i, word in enumerate(words):
        token = word if i == 0 else " " + word
        payload = json.dumps({"token": token})
        yield f"event: token\ndata: {payload}\n\n"
        await asyncio.sleep(token_delay_sec)

    # 2. Final Structured Payload Event
    final_payload = json.dumps({
        "answer": chat_response.answer,
        "citations": [c.model_dump() for c in chat_response.citations],
        "check": chat_response.check.model_dump() if chat_response.check else None,
        "is_not_covered": chat_response.is_not_covered,
        "not_covered_topic": chat_response.not_covered_topic,
        "available_at_sec": chat_response.available_at_sec,
        "session_id": chat_response.session_id,
        "message_id": chat_response.message_id,
        "validation_passed": chat_response.validation_passed,
    })

    yield f"event: final\ndata: {final_payload}\n\n"
