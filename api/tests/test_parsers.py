import os
import pytest
from api.parsers import (
    parse_source,
    parse_timestamp_to_seconds,
    clean_transcript_text,
    TranscriptParser,
    PDFParser,
    PresentationParser,
    NotesParser,
)

SAMPLE_VTT = """WEBVTT - Test Lecture

00:00:05.120 --> 00:00:08.500
<v Dr. Elena>Welcome to Binary Search Trees.</v>

00:00:08.500 --> 00:00:14.200
A BST satisfies the left-subtree invariant.
"""

SAMPLE_SRT = """1
00:00:01,000 --> 00:00:04,500
First subtitle line.

2
00:00:04,500 --> 00:00:09,000
Second subtitle line with <b>bold</b> text.
"""

SAMPLE_MD = """# Binary Search Trees

A BST is a rooted binary tree.

## Invariant

For every node x, left children are smaller than x.

### Complexity

Search runs in O(h) time.
"""


def test_timestamp_parser():
    assert parse_timestamp_to_seconds("00:01:23.456") == 83.456
    assert parse_timestamp_to_seconds("01:23.456") == 83.456
    assert parse_timestamp_to_seconds("00:01:23,456") == 83.456
    assert parse_timestamp_to_seconds("00:00:00.000") == 0.0


def test_clean_transcript_text():
    text, speaker = clean_transcript_text("<v Dr. Elena>Welcome to <b>BST</b>.</v>")
    assert text == "Welcome to BST."
    assert speaker == "Dr. Elena"

    text2, speaker2 = clean_transcript_text("Just plain speech without voice tags.")
    assert text2 == "Just plain speech without voice tags."
    assert speaker2 is None


def test_transcript_parser_vtt():
    blocks = TranscriptParser.parse(SAMPLE_VTT)
    assert len(blocks) == 2
    assert blocks[0].start_sec == 5.12
    assert blocks[0].end_sec == 8.5
    assert blocks[0].speaker == "Dr. Elena"
    assert "Binary Search Trees" in blocks[0].text
    assert blocks[1].start_sec == 8.5
    assert blocks[1].end_sec == 14.2


def test_transcript_parser_srt():
    blocks = TranscriptParser.parse(SAMPLE_SRT)
    assert len(blocks) == 2
    assert blocks[0].start_sec == 1.0
    assert blocks[0].end_sec == 4.5
    assert blocks[0].text == "First subtitle line."
    assert blocks[1].text == "Second subtitle line with bold text."


def test_notes_parser_markdown():
    blocks = NotesParser.parse(SAMPLE_MD)
    assert len(blocks) >= 3
    assert any("Binary Search Trees" in b.text for b in blocks)
    assert any(b.metadata.get("section") == "Invariant" for b in blocks)


def test_pdf_parser_demo_data():
    pdf_path = os.path.join("demo-data", "bst_notes.pdf")
    if os.path.exists(pdf_path):
        blocks = PDFParser.parse(pdf_path)
        assert len(blocks) == 3
        assert blocks[0].page == 1
        assert "Binary Search Trees" in blocks[0].text


def test_presentation_parser_demo_data():
    pptx_path = os.path.join("demo-data", "bst_slides.pptx")
    if os.path.exists(pptx_path):
        blocks = PresentationParser.parse(pptx_path)
        assert len(blocks) == 9
        assert blocks[0].slide == 1
        assert "Binary Search Trees" in blocks[0].text
        # Verify speaker notes preservation
        assert blocks[0].notes is not None
        assert "Welcome students" in blocks[0].notes


def test_unified_parse_source_dispatcher():
    # Video / VTT
    vtt_blocks = parse_source(SAMPLE_VTT, source_type="video", filename="lecture.vtt")
    assert len(vtt_blocks) == 2

    # Markdown notes
    md_blocks = parse_source(SAMPLE_MD, source_type="notes", filename="notes.md")
    assert len(md_blocks) >= 3
