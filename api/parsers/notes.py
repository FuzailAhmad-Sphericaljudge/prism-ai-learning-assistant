import re
from typing import List, Optional
from api.parsers.base import ParsedBlock


class NotesParser:
    """
    Parser for Markdown (.md) and plain text (.txt) instructor notes and summaries.
    Preserves document structure, section headers, and semantic blocks.
    """

    HEADING_PATTERN = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)

    @classmethod
    def parse(cls, content: str) -> List[ParsedBlock]:
        """
        Parses Markdown text into section blocks keyed by heading hierarchy.
        """
        lines = content.replace("\r\n", "\n").replace("\r", "\n").split("\n")
        blocks: List[ParsedBlock] = []

        current_heading: Optional[str] = None
        current_level: Optional[int] = None
        current_lines: List[str] = []

        def flush_block():
            nonlocal current_lines, current_heading, current_level
            text = "\n".join(current_lines).strip()
            if text:
                prefix = f"## {current_heading}\n" if current_heading and not text.startswith("#") else ""
                full_text = f"{prefix}{text}".strip()
                blocks.append(
                    ParsedBlock(
                        text=full_text,
                        metadata={
                            "section": current_heading or "Introduction",
                            "heading_level": current_level or 1,
                        },
                    )
                )
            current_lines = []

        for line in lines:
            heading_match = cls.HEADING_PATTERN.match(line)
            if heading_match:
                # Flush existing accumulated section
                flush_block()
                level = len(heading_match.group(1))
                title = heading_match.group(2).strip()
                current_heading = title
                current_level = level
                current_lines.append(line)
            else:
                current_lines.append(line)

        flush_block()

        # If document had no headings at all, fallback to splitting by paragraph breaks
        if not blocks:
            paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
            for idx, p in enumerate(paragraphs):
                blocks.append(
                    ParsedBlock(
                        text=p,
                        metadata={"paragraph_index": idx + 1},
                    )
                )

        return blocks
