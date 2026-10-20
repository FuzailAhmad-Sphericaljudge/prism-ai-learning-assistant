import re
from typing import List, Optional, Tuple
from api.parsers.base import ParsedBlock


def parse_timestamp_to_seconds(ts_str: str) -> float:
    """
    Parses VTT/SRT timestamp strings into total seconds as float.
    Handles 'HH:MM:SS.mmm', 'HH:MM:SS,mmm', 'MM:SS.mmm', or 'MM:SS,mmm'.
    """
    ts_str = ts_str.strip().replace(",", ".")
    parts = ts_str.split(":")
    if len(parts) == 3:
        hours = float(parts[0])
        minutes = float(parts[1])
        seconds = float(parts[2])
        return round(hours * 3600 + minutes * 60 + seconds, 3)
    elif len(parts) == 2:
        minutes = float(parts[0])
        seconds = float(parts[1])
        return round(minutes * 60 + seconds, 3)
    else:
        raise ValueError(f"Invalid timestamp format: '{ts_str}'")


def clean_transcript_text(text: str) -> Tuple[str, Optional[str]]:
    """
    Cleans transcript markup (HTML tags, WebVTT cue tags) and extracts voice/speaker tags if present.
    Example: '<v Dr. Smith>Welcome to BSTs.</v>' -> ('Welcome to BSTs.', 'Dr. Smith')
    """
    speaker = None
    voice_match = re.search(r"<v\s+([^>]+)>(.*?)(?:</v>|$)", text, re.DOTALL)
    if voice_match:
        speaker = voice_match.group(1).strip()
        text = voice_match.group(2)

    # Strip remaining HTML/VTT tags like <b>, <i>, <c.color>, <00:01.000>
    clean = re.sub(r"<[^>]+>", "", text)
    # Normalize whitespaces
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean, speaker


class TranscriptParser:
    """
    Parser for WebVTT (.vtt) and SubRip (.srt) caption files.
    Preserves exact start_sec and end_sec timestamps for temporal firewall grounding.
    """

    TIMESTAMP_PATTERN = re.compile(
        r"((?:\d{1,2}:)?\d{2}:\d{2}[.,]\d{3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}[.,]\d{3})"
    )

    @classmethod
    def parse(cls, content: str) -> List[ParsedBlock]:
        """
        Parses raw VTT or SRT string content into a sequence of ParsedBlock objects.
        """
        lines = content.replace("\r\n", "\n").replace("\r", "\n").split("\n")
        blocks: List[ParsedBlock] = []

        i = 0
        n = len(lines)

        while i < n:
            line = lines[i].strip()
            
            # Skip empty lines, WEBVTT header, NOTE blocks, or standalone cue numeric IDs
            if not line or line.upper().startswith("WEBVTT") or line.upper().startswith("NOTE"):
                i += 1
                continue

            match = cls.TIMESTAMP_PATTERN.search(line)
            if match:
                start_raw, end_raw = match.group(1), match.group(2)
                try:
                    start_sec = parse_timestamp_to_seconds(start_raw)
                    end_sec = parse_timestamp_to_seconds(end_raw)
                except Exception:
                    i += 1
                    continue

                # Collect following text lines until next blank line or timestamp
                text_lines: List[str] = []
                i += 1
                while i < n and lines[i].strip():
                    if cls.TIMESTAMP_PATTERN.search(lines[i]):
                        # Stepped into next cue without blank line
                        break
                    # If this line is just an integer identifier for the next SRT block, check lookahead
                    if lines[i].strip().isdigit() and i + 1 < n and cls.TIMESTAMP_PATTERN.search(lines[i + 1]):
                        break
                    text_lines.append(lines[i].strip())
                    i += 1

                raw_cue_text = " ".join(text_lines)
                clean_text, speaker = clean_transcript_text(raw_cue_text)

                if clean_text:
                    blocks.append(
                        ParsedBlock(
                            text=clean_text,
                            start_sec=start_sec,
                            end_sec=end_sec,
                            speaker=speaker,
                            metadata={"raw_time_range": f"{start_raw} --> {end_raw}"},
                        )
                    )
            else:
                i += 1

        return blocks
