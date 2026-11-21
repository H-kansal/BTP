"""Classification service – wraps the EfficientNet-B0 weather classifier."""

from __future__ import annotations

import logging
from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms

from app.config import config
from app.models.classifier_model import WeatherClassifier

logger = logging.getLogger(__name__)


class ClassifierService:
    """Loads the classifier weights and exposes a single ``classify`` method.

    Usage::

        svc = ClassifierService()
        svc.load()
        label = svc.classify(pil_image)  # → "rain" | "fog" | "low_light"
    """

    def __init__(self) -> None:
        self.model: WeatherClassifier | None = None
        self._transform = transforms.Compose([
            transforms.Resize((config.IMAGE_SIZE, config.IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=config.IMAGENET_MEAN, std=config.IMAGENET_STD),
        ])

    # ── lifecycle ───────────────────────────────────────────────────────

    def load(self) -> None:
        """Load model weights from disk and move the model to the configured device."""
        weights_path: Path = config.WEIGHTS_DIR / config.CLASSIFIER_WEIGHTS

        self.model = WeatherClassifier(num_classes=config.NUM_CLASSES)

        if weights_path.exists():
            state_dict = torch.load(weights_path, map_location=config.DEVICE, weights_only=True)
            self.model.load_state_dict(state_dict)
            logger.info("Classifier weights loaded from %s", weights_path)
        else:
            logger.warning(
                "Classifier weights not found at %s – running with random weights",
                weights_path,
            )

        self.model.to(config.DEVICE)
        self.model.eval()

    # ── inference ───────────────────────────────────────────────────────

    @torch.no_grad()
    def classify(self, image: Image.Image) -> str:
        """Classify a PIL Image into one of the weather-degradation classes.

        Args:
            image: An RGB PIL Image of arbitrary size (will be resized).

        Returns:
            The predicted class name: ``"rain"``, ``"fog"``, or ``"low_light"``.

        Raises:
            RuntimeError: If :py:meth:`load` has not been called yet.
        """
        if self.model is None:
            raise RuntimeError("ClassifierService has not been loaded. Call load() first.")

        tensor: torch.Tensor = self._transform(image.convert("RGB"))
        tensor = tensor.unsqueeze(0).to(config.DEVICE)

        logits: torch.Tensor = self.model(tensor)
        predicted_idx: int = int(logits.argmax(dim=1).item())
        return config.CLASS_NAMES[predicted_idx]
