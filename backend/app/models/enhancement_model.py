"""Pix2Pix U-Net Generator for 512×512 image enhancement."""

from __future__ import annotations

import torch
import torch.nn as nn


class UNetDown(nn.Module):
    """Downsampling block: Conv2d (stride 2) → BatchNorm → LeakyReLU.

    The first block in the encoder typically skips batch normalisation.
    """

    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        normalize: bool = True,
    ) -> None:
        super().__init__()
        layers: list[nn.Module] = [
            nn.Conv2d(in_channels, out_channels, kernel_size=4, stride=2, padding=1, bias=False),
        ]
        if normalize:
            layers.append(nn.BatchNorm2d(out_channels))
        layers.append(nn.LeakyReLU(0.2, inplace=True))
        self.model = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)


class UNetUp(nn.Module):
    """Upsampling block: ConvTranspose2d (stride 2) → BatchNorm → ReLU → optional Dropout.

    Skip connections are concatenated in the generator's forward method.
    """

    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        dropout: bool = False,
    ) -> None:
        super().__init__()
        layers: list[nn.Module] = [
            nn.ConvTranspose2d(in_channels, out_channels, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        ]
        if dropout:
            layers.append(nn.Dropout(0.5))
        self.model = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.model(x)


class Pix2PixGenerator(nn.Module):
    """U-Net generator for Pix2Pix image-to-image translation at 512×512.

    Encoder path  (512 → 1):
        3 → 64 → 128 → 256 → 512 → 512 → 512 → 512 → 512   (9 blocks)

    Decoder path  (1 → 512) with skip connections:
        mirrors the encoder, final output uses Tanh to produce 3-channel
        images in [-1, 1].
    """

    def __init__(self, in_channels: int = 3, out_channels: int = 3) -> None:
        """Initialise the U-Net generator.

        Args:
            in_channels: Number of input image channels.
            out_channels: Number of output image channels.
        """
        super().__init__()

        # ── Encoder ─────────────────────────────────────────────────────
        self.down1 = UNetDown(in_channels, 64, normalize=False)  # 512→256
        self.down2 = UNetDown(64, 128)                            # 256→128
        self.down3 = UNetDown(128, 256)                           # 128→64
        self.down4 = UNetDown(256, 512)                           # 64→32
        self.down5 = UNetDown(512, 512)                           # 32→16
        self.down6 = UNetDown(512, 512)                           # 16→8
        self.down7 = UNetDown(512, 512)                           # 8→4
        self.down8 = UNetDown(512, 512)                           # 4→2
        self.down9 = UNetDown(512, 512, normalize=False)          # 2→1  (bottleneck)

        # ── Decoder ─────────────────────────────────────────────────────
        self.up1 = UNetUp(512, 512, dropout=True)                 # 1→2
        self.up2 = UNetUp(1024, 512, dropout=True)                # 2→4
        self.up3 = UNetUp(1024, 512, dropout=True)                # 4→8
        self.up4 = UNetUp(1024, 512)                              # 8→16
        self.up5 = UNetUp(1024, 512)                              # 16→32
        self.up6 = UNetUp(1024, 256)                              # 32→64
        self.up7 = UNetUp(512, 128)                               # 64→128
        self.up8 = UNetUp(256, 64)                                # 128→256

        self.final = nn.Sequential(
            nn.ConvTranspose2d(128, out_channels, kernel_size=4, stride=2, padding=1),
            nn.Tanh(),
        )  # 256→512

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass with skip connections.

        Args:
            x: Input tensor of shape ``(B, 3, 512, 512)``.

        Returns:
            Output tensor of shape ``(B, 3, 512, 512)`` with values in [-1, 1].
        """
        # Encoder
        d1 = self.down1(x)
        d2 = self.down2(d1)
        d3 = self.down3(d2)
        d4 = self.down4(d3)
        d5 = self.down5(d4)
        d6 = self.down6(d5)
        d7 = self.down7(d6)
        d8 = self.down8(d7)
        d9 = self.down9(d8)  # bottleneck

        # Decoder with skip connections
        u1 = self.up1(d9)
        u2 = self.up2(torch.cat([u1, d8], dim=1))
        u3 = self.up3(torch.cat([u2, d7], dim=1))
        u4 = self.up4(torch.cat([u3, d6], dim=1))
        u5 = self.up5(torch.cat([u4, d5], dim=1))
        u6 = self.up6(torch.cat([u5, d4], dim=1))
        u7 = self.up7(torch.cat([u6, d3], dim=1))
        u8 = self.up8(torch.cat([u7, d2], dim=1))

        return self.final(torch.cat([u8, d1], dim=1))
