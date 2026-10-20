import pytest
from api.parsers.base import ParsedBlock
from api.chunking import (
    ChunkData,
    TranscriptChunker,
    DocumentChunker,
    chunk_blocks,
)


def test_transcript_chunker_window_and_timestamps():
    cues = [
        ParsedBlock(text="First sentence.", start_sec=0.0, end_sec=5.0, speaker="Speaker A"),
        ParsedBlock(text="Second sentence.", start_sec=5.0, end_sec=11.2, speaker="Speaker A"),
        ParsedBlock(text="Third sentence.", start_sec=11.2, end_sec=17.8, speaker="Speaker B"),
        ParsedBlock(text="Fourth sentence.", start_sec=17.8, end_sec=24.0, speaker="Speaker B"),
        ParsedBlock(text="Fifth sentence.", start_sec=24.0, end_sec=30.0, speaker="Speaker A"),
    ]

    # Target 3 cues with 1 overlap -> step 2
    chunker = TranscriptChunker(target_sentences=3, sentence_overlap=1)
    chunks = chunker.chunk(cues)

    assert len(chunks) == 2
    # Chunk 0: cues 0, 1, 2
    assert chunks[0].start_sec == 0.0
    assert chunks[0].end_sec == 17.8
    assert "First sentence." in chunks[0].text
    assert "Third sentence." in chunks[0].text
    assert "Speaker A" in chunks[0].metadata["speakers"]
    assert "Speaker B" in chunks[0].metadata["speakers"]

    # Chunk 1: cues 2, 3, 4 (overlaps cue 2)
    assert chunks[1].start_sec == 11.2
    assert chunks[1].end_sec == 30.0
    assert "Third sentence." in chunks[1].text
    assert "Fifth sentence." in chunks[1].text


def test_transcript_chunker_empty_and_single():
    chunker = TranscriptChunker()
    assert chunker.chunk([]) == []

    single = [ParsedBlock(text="Lone cue.", start_sec=2.5, end_sec=4.0)]
    res = chunker.chunk(single)
    assert len(res) == 1
    assert res[0].start_sec == 2.5
    assert res[0].end_sec == 4.0
    assert res[0].text == "Lone cue."


def test_document_chunker_pdf_page_preservation():
    pdf_blocks = [
        ParsedBlock(text="Page 1 short content.", page=1),
        ParsedBlock(text="Page 2 text discussing BST search path.", page=2),
    ]
    chunks = DocumentChunker.chunk_pdf(pdf_blocks)
    assert len(chunks) == 2
    assert chunks[0].page == 1
    assert chunks[1].page == 2
    assert "BST search" in chunks[1].text


def test_document_chunker_pdf_long_page_splitting():
    long_para = "This is a detailed paragraph explaining asymptotic bounds. " * 30
    pdf_blocks = [
        ParsedBlock(text=f"{long_para}\n\n{long_para}", page=5),
    ]
    chunks = DocumentChunker.chunk_pdf(pdf_blocks)
    assert len(chunks) >= 2
    for c in chunks:
        # All sub-chunks must retain page 5!
        assert c.page == 5


def test_document_chunker_pptx_notes_attachment():
    slide_blocks = [
        ParsedBlock(
            text="Slide Title: BST Invariant",
            slide=3,
            notes="Emphasize that invariant is global to entire subtree.",
        ),
    ]
    chunks = DocumentChunker.chunk_pptx(slide_blocks)
    assert len(chunks) == 1
    assert chunks[0].slide == 3
    assert "[Speaker Notes]:" in chunks[0].text
    assert "invariant is global" in chunks[0].metadata["notes"]


def test_unified_chunk_blocks_pipeline():
    vtt_blocks = [
        ParsedBlock(text="Spoken sentence one.", start_sec=0.0, end_sec=3.0),
        ParsedBlock(text="Spoken sentence two.", start_sec=3.0, end_sec=6.0),
    ]
    chunks = chunk_blocks(vtt_blocks, source_type="video")
    assert len(chunks) == 1
    assert chunks[0].start_sec == 0.0
    assert chunks[0].end_sec == 6.0
