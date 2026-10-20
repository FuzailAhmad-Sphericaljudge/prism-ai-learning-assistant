import io
import re
from typing import List, Union
from pypdf import PdfReader
from api.parsers.base import ParsedBlock


class PDFParser:
    """
    Document parser for PDF course readings and textbook chapters.
    Preserves 1-based page numbers for citation in PRISM's multi-modal Evidence Inspector.
    """

    @classmethod
    def parse(cls, file_source: Union[str, bytes, io.BytesIO]) -> List[ParsedBlock]:
        """
        Parses a PDF from file path, bytes, or BytesIO stream.
        Returns a list of ParsedBlock objects, one per non-empty page.
        """
        if isinstance(file_source, bytes):
            stream = io.BytesIO(file_source)
        elif isinstance(file_source, str):
            stream = open(file_source, "rb")
        else:
            stream = file_source

        try:
            reader = PdfReader(stream)
            total_pages = len(reader.pages)
            blocks: List[ParsedBlock] = []

            for idx, page in enumerate(reader.pages):
                page_num = idx + 1
                try:
                    raw_text = page.extract_text() or ""
                except Exception:
                    raw_text = ""

                # Normalize whitespace and hyphenated line breaks
                clean_text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", raw_text)
                clean_text = re.sub(r"\s+", " ", clean_text).strip()

                if clean_text:
                    blocks.append(
                        ParsedBlock(
                            text=clean_text,
                            page=page_num,
                            metadata={
                                "total_pages": total_pages,
                                "page_index": idx,
                            },
                        )
                    )

            return blocks
        finally:
            if isinstance(file_source, str) and not stream.closed:
                stream.close()
