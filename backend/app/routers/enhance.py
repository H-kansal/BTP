"""Router for single-image enhancement."""

from __future__ import annotations

import asyncio
import logging

from fastapi import APIRouter, File, HTTPException, Request, UploadFile
from PIL import Image

from app.utils.image_utils import encode_image_base64, resize_for_model

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/enhance", tags=["enhance"])


@router.post("/image")
async def enhance_image(request: Request, file: UploadFile = File(...)) -> dict:
    """Accept an image file, classify its degradation type, and enhance it.

    Returns a JSON object containing the classification result and a
    base64-encoded enhanced image.
    """
    # ── validate ────────────────────────────────────────────────────────
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    try:
        contents = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {exc}")

    # ── open image ──────────────────────────────────────────────────────
    import io

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {exc}")

    image = resize_for_model(image)

    # ── classify (offload to thread) ────────────────────────────────────
    classifier_service = request.app.state.classifier
    try:
        degradation_type: str = await asyncio.to_thread(classifier_service.classify, image)
    except Exception as exc:
        logger.error("Classification failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Classification error: {exc}")

    # ── enhance (offload to thread) ─────────────────────────────────────
    enhancer_service = request.app.state.enhancer
    try:
        enhanced_image: Image.Image = await asyncio.to_thread(
            enhancer_service.enhance, image, degradation_type
        )
    except Exception as exc:
        logger.error("Enhancement failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Enhancement error: {exc}")

    # ── response ────────────────────────────────────────────────────────
    encoded = encode_image_base64(enhanced_image, fmt="PNG")

    return {
        "classification": degradation_type,
        "enhanced_image_base64": encoded,
        "original_size": list(image.size),
    }
