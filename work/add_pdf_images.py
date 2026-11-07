#!/usr/bin/env python3
"""Attach every embedded illustration in the PDF to the question it accompanies."""
from __future__ import annotations

import base64
import json
import re
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
PDF_PATH = ROOT / "uploads" / "Сборник.pdf"
DB_PATH = ROOT / "db.json"
QUESTION_MARKER = re.compile(r"^\s*(\d{1,2})\.(\d{1,3})(?:\s|$)")
MIME_TYPES = {"jpeg": "image/jpeg", "jpg": "image/jpeg", "png": "image/png"}


def image_data_uri(doc: pymupdf.Document, xref: int, cache: dict[int, str]) -> str:
    if xref not in cache:
        extracted = doc.extract_image(xref)
        ext = extracted["ext"].lower()
        if ext not in MIME_TYPES:
            pixmap = pymupdf.Pixmap(doc, xref)
            extracted = {"ext": "png", "image": pixmap.tobytes("png")}
            ext = "png"
        cache[xref] = "data:" + MIME_TYPES[ext] + ";base64," + base64.b64encode(extracted["image"]).decode("ascii")
    return cache[xref]


def main() -> None:
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
    questions = {q["id"]: q for q in data["questions"]}
    document = pymupdf.open(PDF_PATH)
    images_by_question: dict[str, list[str]] = {}
    cache: dict[int, str] = {}
    current_question: str | None = None
    placements = 0

    for page in document:
        events = []
        for block in page.get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                text = "".join(span["text"] for span in line["spans"]).strip()
                match = QUESTION_MARKER.match(text)
                if not match:
                    continue
                question_id = f"{int(match.group(1))}.{int(match.group(2))}"
                if question_id in questions:
                    # Question markers win ties with images at the same vertical position.
                    events.append((line["bbox"][1], 0, "question", question_id))

        for info in page.get_image_info(xrefs=True):
            events.append((info["bbox"][1], 1, "image", info["xref"]))

        for _, _, kind, value in sorted(events, key=lambda event: (event[0], event[1])):
            if kind == "question":
                current_question = value
                continue
            if not current_question:
                raise RuntimeError(f"Found an image before a question marker on PDF page {page.number + 1}")
            images_by_question.setdefault(current_question, []).append(image_data_uri(document, int(value), cache))
            placements += 1

    if not placements:
        raise RuntimeError("No PDF illustrations were mapped to questions")

    for question in data["questions"]:
        question_id = question["id"]
        if question_id in images_by_question:
            question["imgs"] = images_by_question[question_id]
        else:
            question.pop("imgs", None)

    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Mapped {placements} image placements to {len(images_by_question)} questions; cached {len(cache)} unique images.")


if __name__ == "__main__":
    main()
