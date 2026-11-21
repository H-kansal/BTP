"""EfficientNet-B0 classifier adapted for 3-class weather degradation."""

from __future__ import annotations

import torch
import torch.nn as nn
from torchvision import models


class WeatherClassifier(nn.Module):
    """EfficientNet-B0 fine-tuned for weather-degradation classification.

    The final fully-connected layer is replaced so the network outputs
    ``num_classes`` logits (default 3: rain, fog, low_light).
    """

    def __init__(self, num_classes: int = 3) -> None:
        """Initialise the classifier.

        Args:
            num_classes: Number of output classes.
        """
        super().__init__()
        self.backbone = models.efficientnet_b0(weights=None)
        in_features: int = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(in_features, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass.

        Args:
            x: Input tensor of shape ``(B, 3, H, W)``.

        Returns:
            Logits tensor of shape ``(B, num_classes)``.
        """
        return self.backbone(x)
