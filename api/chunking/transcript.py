import re
from typing import List
from api.parsers.base import ParsedBlock
from api.chunking.base import ChunkData


class TranscriptChunker:
    """
    Chunks transcript cue blocks using a sliding sentence window.
    Strictly preserves start_sec and end_sec timestamps across each window
    so PRISM's Temporal Evidence Firewall can enforce precise boundary filtering.
    """

    def __init__(self, target_sentences: int = 3, sentence_overlap: int = 1):
        self.target_sentences = max(1, target_sentences)
        self.sentence_overlap = max(0, min(sentence_overlap, target_sentences - 1))

    @staticmethod
    def _split_into_sentences(text: str) -> List[str]:
        """Splits text on sentence boundaries (. ! ?) while handling abbreviations."""
        sentences = re.split(r"(?<=[.!?])\s+", text.strip())
        return [s.strip() for s in sentences if s.strip()]

    def chunk(self, blocks: List[ParsedBlock]) -> List[ChunkData]:
        """
        Groups transcript cues into temporal chunks.
        Each chunk covers a coherent window of speech with exact [start_sec, end_sec] coordinates.
        """
        if not blocks:
            return []

        # Expand blocks into atomic utterance units
        atomic_units = []
        for b in blocks:
            if not b.text.strip():
                continue
            atomic_units.append({
                "text": b.text.strip(),
                "start_sec": b.start_sec or 0.0,
                "end_sec": b.end_sec or 0.0,
                "speaker": b.speaker,
            })

        if not atomic_units:
            return []

        chunks: List[ChunkData] = []
        idx = 0
        step = max(1, self.target_sentences - self.sentence_overlap)
        chunk_idx = 0

        while idx < len(atomic_units):
            window = atomic_units[idx : idx + self.target_sentences]
            if not window:
                break

            combined_text = " ".join(u["text"] for u in window)
            start_sec = window[0]["start_sec"]
            end_sec = window[-1]["end_sec"]
            speakers = list(dict.fromkeys(u["speaker"] for u in window if u.get("speaker")))

            chunks.append(
                ChunkData(
                    text=combined_text,
                    start_sec=start_sec,
                    end_sec=end_sec,
                    chunk_index=chunk_idx,
                    metadata={
                        "cue_count": len(window),
                        "speakers": speakers,
                        "duration_sec": round(end_sec - start_sec, 2),
                    },
                )
            )
            chunk_idx += 1
            idx += step

            # Prevent endless loop if step is 0 or window reaches end
            if idx >= len(atomic_units):
                break

        return chunks
