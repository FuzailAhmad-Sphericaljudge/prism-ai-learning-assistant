import re
from typing import List
from api.parsers.base import ParsedBlock
from api.chunking.base import ChunkData


class DocumentChunker:
    """
    Chunker for PDF textbooks, PPTX slide decks, and Markdown notes.
    Preserves spatial coordinates (page and slide numbers) for multi-modal citation.
    """

    MAX_CHUNK_CHARS = 1200
    CHUNK_OVERLAP_CHARS = 150

    @classmethod
    def chunk_pdf(cls, blocks: List[ParsedBlock]) -> List[ChunkData]:
        """
        Chunks PDF blocks by page. If a single page exceeds MAX_CHUNK_CHARS,
        splits into sub-page paragraphs while preserving the page number.
        """
        chunks: List[ChunkData] = []
        chunk_idx = 0

        for block in blocks:
            page_num = block.page or 1
            text = block.text.strip()
            if not text:
                continue

            if len(text) <= cls.MAX_CHUNK_CHARS:
                chunks.append(
                    ChunkData(
                        text=text,
                        page=page_num,
                        chunk_index=chunk_idx,
                        metadata=block.metadata,
                    )
                )
                chunk_idx += 1
            else:
                # Split page text by paragraph or sentences
                paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
                buffer = ""
                for p in paragraphs:
                    if len(buffer) + len(p) + 1 > cls.MAX_CHUNK_CHARS and buffer:
                        chunks.append(
                            ChunkData(
                                text=buffer.strip(),
                                page=page_num,
                                chunk_index=chunk_idx,
                                metadata={**block.metadata, "is_subpage": True},
                            )
                        )
                        chunk_idx += 1
                        buffer = p + " "
                    else:
                        buffer += p + " "

                if buffer.strip():
                    chunks.append(
                        ChunkData(
                            text=buffer.strip(),
                            page=page_num,
                            chunk_index=chunk_idx,
                            metadata={**block.metadata, "is_subpage": True},
                        )
                    )
                    chunk_idx += 1

        return chunks

    @classmethod
    def chunk_pptx(cls, blocks: List[ParsedBlock]) -> List[ChunkData]:
        """
        Chunks PPTX blocks by slide. Preserves slide number and attaches speaker notes.
        """
        chunks: List[ChunkData] = []
        for idx, block in enumerate(blocks):
            slide_num = block.slide or (idx + 1)
            content = block.text.strip()
            if block.notes and block.notes not in content:
                content = f"{content}\n[Speaker Notes]: {block.notes}"

            chunks.append(
                ChunkData(
                    text=content,
                    slide=slide_num,
                    chunk_index=idx,
                    metadata={
                        **block.metadata,
                        "notes": block.notes,
                    },
                )
            )
        return chunks

    @classmethod
    def chunk_notes(cls, blocks: List[ParsedBlock]) -> List[ChunkData]:
        """
        Chunks Markdown notes blocks by section or paragraph.
        """
        chunks: List[ChunkData] = []
        for idx, block in enumerate(blocks):
            chunks.append(
                ChunkData(
                    text=block.text.strip(),
                    chunk_index=idx,
                    metadata=block.metadata,
                )
            )
        return chunks
