"""Enhancement service – wraps the three Pix2Pix generators."""

from __future__ import annotations

import logging
from pathlib import Path

import torch
from PIL import Image

from app.config import config
from app.models.enhancement_model import Pix2PixGenerator
from app.utils.image_utils import pil_to_tensor, tensor_to_pil

logger = logging.getLogger(__name__)


class EnhancerService:
    """Loads the per-class Pix2Pix generators and exposes an ``enhance`` method.

    Usage::

        svc = EnhancerService()
        svc.load()
        enhanced = svc.enhance(pil_image, "rain")
    """

    def __init__(self) -> None:
        self.generators: dict[str, Pix2PixGenerator] = {}

    # ── lifecycle ───────────────────────────────────────────────────────

    def load(self) -> None:
        """Load all three generator weight files and move models to the device."""
        for class_name, weight_file in config.ENHANCER_WEIGHTS.items():
            weights_path: Path = config.WEIGHTS_DIR / weight_file
            generator = Pix2PixGenerator(in_channels=3, out_channels=3)

            if weights_path.exists():
                state_dict = torch.load(weights_path, map_location=config.DEVICE, weights_only=True)
                generator.load_state_dict(state_dict)
                logger.info("Loaded %s enhancer weights from %s", class_name, weights_path)
            else:
                logger.warning(
                    "%s enhancer weights not found at %s – running with random weights",
                    class_name,
                    weights_path,
                )

            generator.to(config.DEVICE)
            generator.eval()
            self.generators[class_name] = generator

    # ── inference ───────────────────────────────────────────────────────

    @torch.no_grad()
    def enhance(self, image: Image.Image, degradation_type: str) -> Image.Image:
        """Enhance a degraded image using the appropriate Pix2Pix generator.

        Args:
            image: An RGB PIL Image (will be resized to 512×512).
            degradation_type: One of ``"rain"``, ``"fog"``, or ``"low_light"``.

        Returns:
            An enhanced RGB PIL Image.

        Raises:
            ValueError: If *degradation_type* is not recognised.
            RuntimeError: If :py:meth:`load` has not been called yet.
        """
        if not self.generators:
            raise RuntimeError("EnhancerService has not been loaded. Call load() first.")

        if degradation_type not in self.generators:
            raise ValueError(
                f"Unknown degradation type '{degradation_type}'. "
                f"Expected one of {list(self.generators.keys())}."
            )

        generator = self.generators[degradation_type]

        # Normalise to [-1, 1] for the generator
        input_tensor: torch.Tensor = pil_to_tensor(image, normalize=True)
        output_tensor: torch.Tensor = generator(input_tensor)

        return tensor_to_pil(output_tensor)
