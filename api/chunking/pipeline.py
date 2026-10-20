from typing import List
from api.parsers.base import ParsedBlock
from api.chunking.base import ChunkData
from api.chunking.transcript import TranscriptChunker
from api.chunking.document import DocumentChunker


def chunk_blocks(blocks: List[ParsedBlock], source_type: str) -> List[ChunkData]:
    """
    Unified chunking pipeline. Routes parsed multi-modal content blocks
    into their optimal semantic and temporal chunk representations.
    """
    st = (source_type or "").lower().strip()

    if st in ("video", "transcript"):
        chunker = TranscriptChunker(target_sentences=3, sentence_overlap=1)
        return chunker.chunk(blocks)

    elif st in ("pdf", "document"):
        return DocumentChunker.chunk_pdf(blocks)

    elif st in ("ppt", "pptx", "presentation"):
        return DocumentChunker.chunk_pptx(blocks)

    elif st in ("notes", "markdown"):
        return DocumentChunker.chunk_notes(blocks)

    else:
        return DocumentChunker.chunk_notes(blocks)
