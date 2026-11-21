# Model Weight Files

Place the following pre-trained weight files in this directory before starting the server:

| File                    | Description                                           |
|-------------------------|-------------------------------------------------------|
| `classifier.pth`        | EfficientNet-B0 weights for 3-class weather classification (rain / fog / low_light) |
| `rain_enhancer.pth`     | Pix2Pix U-Net generator weights for rain removal      |
| `fog_enhancer.pth`      | Pix2Pix U-Net generator weights for defogging          |
| `lowlight_enhancer.pth` | Pix2Pix U-Net generator weights for low-light enhancement |

## Expected Architectures

- **Classifier** – `WeatherClassifier` from `app/models/classifier_model.py` (EfficientNet-B0, 3-class output).
- **Enhancers** – `Pix2PixGenerator` from `app/models/enhancement_model.py` (U-Net, 3→3 channels, 512×512 resolution).

## How to load manually (example)

```python
import torch
from app.models.classifier_model import WeatherClassifier
from app.models.enhancement_model import Pix2PixGenerator

classifier = WeatherClassifier(num_classes=3)
classifier.load_state_dict(torch.load("app/weights/classifier.pth", map_location="cpu"))

generator = Pix2PixGenerator()
generator.load_state_dict(torch.load("app/weights/rain_enhancer.pth", map_location="cpu"))
```
