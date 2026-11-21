"""Application configuration for the adverse-weather enhancement backend."""

import os
from pathlib import Path

import torch


class Config:
    """Central configuration for the application.

    Holds all paths, model settings, and device configuration used across
    the backend services.
    """

    # ── Base paths ──────────────────────────────────────────────────────
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    OUTPUT_DIR: Path = BASE_DIR / "outputs"
    WEIGHTS_DIR: Path = BASE_DIR / "app" / "weights"

    # ── Model settings ──────────────────────────────────────────────────
    IMAGE_SIZE: int = 512
    NUM_CLASSES: int = 3
    CLASS_NAMES: list[str] = ["rain", "fog", "low_light"]

    # ImageNet normalisation statistics used by the classifier
    IMAGENET_MEAN: list[float] = [0.485, 0.456, 0.406]
    IMAGENET_STD: list[float] = [0.229, 0.224, 0.225]

    # ── Weight file names ───────────────────────────────────────────────
    CLASSIFIER_WEIGHTS: str = "classifier.pth"
    ENHANCER_WEIGHTS: dict[str, str] = {
        "rain": "rain_enhancer.pth",
        "fog": "fog_enhancer.pth",
        "low_light": "lowlight_enhancer.pth",
    }

    # ── Device auto-detection ───────────────────────────────────────────
    DEVICE: torch.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ── Server settings ────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    @classmethod
    def ensure_dirs(cls) -> None:
        """Create required directories if they do not already exist."""
        cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        cls.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        cls.WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)


config = Config()
