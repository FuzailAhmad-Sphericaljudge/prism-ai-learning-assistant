import io
from typing import List, Optional, Union
from api.parsers.base import ParsedBlock, ParsedDocument
from api.parsers.transcript import TranscriptParser, parse_timestamp_to_seconds, clean_transcript_text
from api.parsers.pdf import PDFParser
from api.parsers.presentation import PresentationParser
from api.parsers.notes import NotesParser


def parse_source(
    content_or_path: Union[str, bytes, io.BytesIO],
    source_type: str,
    filename: Optional[str] = None,
) -> List[ParsedBlock]:
    """
    Unified entry point to parse any supported course source material.
    Routes by explicit source_type or file extension.
    """
    st = (source_type or "").lower().strip()
    fn = (filename or "").lower().strip()

    # Determine parser based on type or filename extension
    if st in ("video", "transcript") or fn.endswith(".vtt") or fn.endswith(".srt"):
        if isinstance(content_or_path, bytes):
            text = content_or_path.decode("utf-8", errors="replace")
        elif isinstance(content_or_path, str) and ("\n" in content_or_path or "WEBVTT" in content_or_path):
            text = content_or_path
        elif isinstance(content_or_path, str):
            with open(content_or_path, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
        else:
            raise ValueError("Unsupported input format for transcript parser")
        return TranscriptParser.parse(text)

    elif st in ("pdf", "document") or fn.endswith(".pdf"):
        return PDFParser.parse(content_or_path)

    elif st in ("ppt", "pptx", "presentation") or fn.endswith(".pptx") or fn.endswith(".ppt"):
        return PresentationParser.parse(content_or_path)

    elif st in ("notes", "markdown") or fn.endswith(".md") or fn.endswith(".txt"):
        if isinstance(content_or_path, bytes):
            text = content_or_path.decode("utf-8", errors="replace")
        elif isinstance(content_or_path, str) and ("\n" in content_or_path or "#" in content_or_path):
            text = content_or_path
        elif isinstance(content_or_path, str):
            with open(content_or_path, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
        else:
            raise ValueError("Unsupported input format for notes parser")
        return NotesParser.parse(text)

    else:
        # Default fallback to plain text parsing
        if isinstance(content_or_path, bytes):
            text = content_or_path.decode("utf-8", errors="replace")
        elif isinstance(content_or_path, str):
            text = content_or_path
        else:
            text = ""
        return NotesParser.parse(text)


__all__ = [
    "ParsedBlock",
    "ParsedDocument",
    "TranscriptParser",
    "PDFParser",
    "PresentationParser",
    "NotesParser",
    "parse_timestamp_to_seconds",
    "clean_transcript_text",
    "parse_source",
]
