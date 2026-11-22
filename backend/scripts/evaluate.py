"""Comprehensive Evaluation Script for WeatherVision BTP.

Computes:
1. Classifier Metrics: Accuracy, Precision, Recall, F1-Score, Confusion Matrix
2. Restoration Metrics: PSNR, SSIM, LPIPS, LNCC (Local Normalized Cross-Correlation)

Usage:
    # 1. Evaluate Classifier:
    python backend/scripts/evaluate.py --mode classifier --data-dir "D:/btp/BTP/bdd100k_conditions/train"

    # 2. Evaluate Enhancer (Paired test set):
    python backend/scripts/evaluate.py --mode enhancer --condition rain --degraded-dir "path/to/rainy" --ground-truth-dir "path/to/clear"
"""

import argparse
import os
from pathlib import Path
import time
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

# Import skimage metrics
try:
    from skimage.metrics import peak_signal_noise_ratio as psnr_fn
    from skimage.metrics import structural_similarity as ssim_fn
except ImportError:
    psnr_fn = None
    ssim_fn = None

# Import sklearn metrics
try:
    from sklearn.metrics import classification_report, confusion_matrix
except ImportError:
    classification_report = None
    confusion_matrix = None

# Import lpips
try:
    import lpips
    lpips_model = lpips.LPIPS(net="alex")
except Exception:
    lpips_model = None

# Backend model imports
import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.config import config
from app.services.classifier import ClassifierService
from app.services.enhancer import EnhancerService


def compute_lncc(img1: np.ndarray, img2: np.ndarray, window_size: int = 9, eps: float = 1e-5) -> float:
    """Computes Local Normalized Cross-Correlation (LNCC) between two RGB images.
    
    Formula:
        LNCC(x, y) = E[(I1 - mu1)(I2 - mu2)] / (sigma1 * sigma2 + eps)
    
    Range: [-1.0, 1.0] where 1.0 indicates perfect local structural correlation.
    
    Why LNCC?
    Unlike standard MSE or PSNR, LNCC is invariant to local gain (brightness) and offset,
    making it particularly well-suited for evaluating low-light enhancement and defogging,
    where global pixel intensities intentionally diverge but edge/feature structures must match.
    """
    # Convert RGB to grayscale float in [0, 1]
    if img1.ndim == 3 and img1.shape[2] == 3:
        g1 = 0.2989 * img1[:, :, 0] + 0.5870 * img1[:, :, 1] + 0.1140 * img1[:, :, 2]
    else:
        g1 = img1.astype(np.float32)

    if img2.ndim == 3 and img2.shape[2] == 3:
        g2 = 0.2989 * img2[:, :, 0] + 0.5870 * img2[:, :, 1] + 0.1140 * img2[:, :, 2]
    else:
        g2 = img2.astype(np.float32)

    t1 = torch.from_numpy(g1).float().unsqueeze(0).unsqueeze(0) / 255.0  # [1, 1, H, W]
    t2 = torch.from_numpy(g2).float().unsqueeze(0).unsqueeze(0) / 255.0  # [1, 1, H, W]

    kernel = torch.ones(1, 1, window_size, window_size, dtype=torch.float32) / (window_size * window_size)
    padding = window_size // 2

    # Local means
    u1 = F.conv2d(t1, kernel, padding=padding)
    u2 = F.conv2d(t2, kernel, padding=padding)

    # Local variances and cross-covariance
    u1_sq = F.conv2d(t1 * t1, kernel, padding=padding)
    u2_sq = F.conv2d(t2 * t2, kernel, padding=padding)
    u12 = F.conv2d(t1 * t2, kernel, padding=padding)

    var1 = torch.clamp(u1_sq - u1 * u1, min=0.0)
    var2 = torch.clamp(u2_sq - u2 * u2, min=0.0)
    cov = u12 - u1 * u2

    # Local Normalized Cross Correlation map
    lncc_map = cov / (torch.sqrt(var1 * var2) + eps)
    # Clip numerical outliers to [-1.0, 1.0]
    lncc_map = torch.clamp(lncc_map, -1.0, 1.0)

    return float(torch.mean(lncc_map).item())


def evaluate_classifier(data_dir: str):
    """Evaluates the 3-class classifier on a dataset structured with subfolders:
       data_dir/fog, data_dir/low_light, data_dir/rain
    """
    print(f"\n=======================================================")
    print(f"        EVALUATING CLASSIFIER (EfficientNet-B0)        ")
    print(f"=======================================================")
    
    data_path = Path(data_dir)
    if not data_path.exists():
        print(f"Error: Dataset directory '{data_dir}' not found.")
        return

    classifier = ClassifierService()
    classifier.load()

    y_true = []
    y_pred = []
    latencies = []

    # Map possible folder names to canonical class names
    folder_mapping = {
        "fog": "fog", "foggy": "fog", "dense_fog": "fog",
        "low_light": "low_light", "lowlight": "low_light", "dark": "low_light", "night": "low_light",
        "rain": "rain", "rainy": "rain"
    }

    subdirs = [d for d in data_path.iterdir() if d.is_dir()]
    if not subdirs:
        print(f"No class subdirectories found in {data_dir}. Expected folders like: fog, low_light, rain")
        return

    for subdir in subdirs:
        class_key = subdir.name.lower()
        if class_key not in folder_mapping:
            continue
        canonical_label = folder_mapping[class_key]
        image_files = [f for f in subdir.iterdir() if f.suffix.lower() in [".jpg", ".jpeg", ".png", ".bmp"]]
        print(f"-> Processing class '{canonical_label}' ({len(image_files)} images in {subdir.name})...")

        for img_file in image_files:
            try:
                img = Image.open(img_file).convert("RGB")
                t0 = time.time()
                pred = classifier.classify(img)
                latencies.append((time.time() - t0) * 1000)

                y_true.append(canonical_label)
                y_pred.append(pred)
            except Exception as e:
                print(f"Failed on {img_file.name}: {e}")

    if not y_true:
        print("No valid test images evaluated.")
        return

    classes = config.CLASS_NAMES # ["fog", "low_light", "rain"]
    print("\n---------------- CLASSIFICATION REPORT ----------------")
    print(classification_report(y_true, y_pred, labels=classes, digits=4))

    print("------------------ CONFUSION MATRIX -------------------")
    cm = confusion_matrix(y_true, y_pred, labels=classes)
    header = f"{'':>12}" + "".join([f"{c:>12}" for c in classes])
    print(header)
    for i, row in enumerate(cm):
        row_str = f"{classes[i]:>12}" + "".join([f"{val:>12}" for val in row])
        print(row_str)

    avg_latency = np.mean(latencies)
    print("-------------------------------------------------------")
    print(f"Total Images Evaluated : {len(y_true)}")
    print(f"Average Inference Time : {avg_latency:.2f} ms ({1000/avg_latency:.1f} FPS)")
    print("=======================================================\n")


def evaluate_enhancer(condition: str, degraded_dir: str = None, ground_truth_dir: str = None,
                      degraded_img_path: str = None, ground_truth_img_path: str = None):
    """Evaluates the Pix2Pix Generator by comparing generated output against ground truth.
       Computes PSNR (dB), SSIM (0-1), LPIPS (distance), and LNCC (Local Normalized Cross-Correlation).
    """
    print(f"\n=======================================================")
    print(f"       EVALUATING ENHANCER ({condition.upper()} GAN)        ")
    print(f"=======================================================")

    enhancer = EnhancerService()
    enhancer.load()

    pairs = []
    if degraded_img_path and ground_truth_img_path:
        # Single pair evaluation
        pairs.append((Path(degraded_img_path), Path(ground_truth_img_path)))
    elif degraded_dir and ground_truth_dir:
        deg_path = Path(degraded_dir)
        gt_path = Path(ground_truth_dir)

        if not deg_path.exists() or not gt_path.exists():
            print(f"Error: Missing degraded or ground truth directory.")
            return

        extensions = [".png", ".jpg", ".jpeg", ".bmp"]
        deg_files = sorted([f for f in deg_path.iterdir() if f.suffix.lower() in extensions])
        for deg_file in deg_files:
            gt_file = gt_path / deg_file.name
            if not gt_file.exists():
                matches = list(gt_path.glob(f"{deg_file.stem}.*"))
                if matches:
                    gt_file = matches[0]
                else:
                    continue
            pairs.append((deg_file, gt_file))
    else:
        print("Error: Provide either (--degraded-dir and --ground-truth-dir) OR (--degraded-image and --ground-truth-image).")
        return

    if not pairs:
        print("No matching image pairs found.")
        return

    psnr_scores = []
    ssim_scores = []
    lncc_scores = []
    lpips_scores = []
    latencies = []

    print(f"Evaluating {len(pairs)} image pair(s) against ground truth...")

    for i, (deg_file, gt_file) in enumerate(pairs):
        try:
            deg_img = Image.open(deg_file).convert("RGB")
            gt_img = Image.open(gt_file).convert("RGB")

            # Match ground truth size to degraded input size
            gt_img = gt_img.resize(deg_img.size)

            t0 = time.time()
            enhanced_img = enhancer.enhance(deg_img, condition)
            latencies.append((time.time() - t0) * 1000)

            enh_np = np.array(enhanced_img)
            gt_np = np.array(gt_img)

            # 1. PSNR (dB)
            score_psnr = psnr_fn(gt_np, enh_np, data_range=255)
            psnr_scores.append(score_psnr)

            # 2. SSIM (0 to 1)
            score_ssim = ssim_fn(gt_np, enh_np, channel_axis=2, data_range=255)
            ssim_scores.append(score_ssim)

            # 3. LNCC (Local Normalized Cross-Correlation)
            score_lncc = compute_lncc(gt_np, enh_np)
            lncc_scores.append(score_lncc)

            # 4. LPIPS (if available)
            if lpips_model:
                t_enh = (torch.from_numpy(enh_np).permute(2, 0, 1).float() / 127.5) - 1.0
                t_gt = (torch.from_numpy(gt_np).permute(2, 0, 1).float() / 127.5) - 1.0
                with torch.no_grad():
                    dist = lpips_model(t_enh.unsqueeze(0), t_gt.unsqueeze(0)).item()
                lpips_scores.append(dist)

            if len(pairs) == 1:
                print(f"\n[Result for {deg_file.name}]")
                print(f"  • PSNR  : {score_psnr:.2f} dB")
                print(f"  • SSIM  : {score_ssim:.4f}")
                print(f"  • LNCC  : {score_lncc:.4f}")
                if lpips_scores:
                    print(f"  • LPIPS : {lpips_scores[-1]:.4f}")
            elif (i + 1) % 25 == 0 or (i + 1) == len(pairs):
                print(f"Processed [{i + 1}/{len(pairs)}] -> Avg PSNR: {np.mean(psnr_scores):.2f} dB, Avg SSIM: {np.mean(ssim_scores):.4f}, Avg LNCC: {np.mean(lncc_scores):.4f}")

        except Exception as e:
            print(f"Error on {deg_file.name}: {e}")

    if not psnr_scores:
        print("No paired images were successfully evaluated.")
        return

    print("\n---------------- RESTORATION RESULTS ------------------")
    print(f"Total Paired Images Evaluated : {len(psnr_scores)}")
    print(f"Average PSNR (Peak SNR)       : {np.mean(psnr_scores):.2f} dB   (Higher is better)")
    print(f"Average SSIM (Structural)     : {np.mean(ssim_scores):.4f}      (Higher is better)")
    print(f"Average LNCC (Local Cross-Corr): {np.mean(lncc_scores):.4f}      (Higher is better, max 1.0)")
    if lpips_scores:
        print(f"Average LPIPS (Perceptual)    : {np.mean(lpips_scores):.4f}      (Lower is better)")
    print(f"Average Inference Latency     : {np.mean(latencies):.2f} ms ({1000/np.mean(latencies):.1f} FPS)")
    print("=======================================================\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="WeatherVision Model Evaluation")
    parser.add_argument("--mode", choices=["classifier", "enhancer"], required=True, help="What to evaluate")
    parser.add_argument("--condition", choices=["rain", "fog", "low_light"], default="rain", help="Condition for enhancer")
    parser.add_argument("--data-dir", type=str, help="Dataset directory for classifier (with class subfolders)")
    parser.add_argument("--degraded-dir", type=str, help="Directory of degraded images (rain/fog/night)")
    parser.add_argument("--ground-truth-dir", type=str, help="Directory of clean reference images")
    parser.add_argument("--degraded-image", type=str, help="Path to a single degraded test image")
    parser.add_argument("--ground-truth-image", type=str, help="Path to matching single clean ground truth image")

    args = parser.parse_args()

    if args.mode == "classifier":
        if not args.data_dir:
            print("Please specify --data-dir <path_to_test_dataset>")
        else:
            evaluate_classifier(args.data_dir)
    elif args.mode == "enhancer":
        if args.degraded_image and args.ground_truth_image:
            evaluate_enhancer(args.condition, degraded_img_path=args.degraded_image, ground_truth_img_path=args.ground_truth_image)
        elif args.degraded_dir and args.ground_truth_dir:
            evaluate_enhancer(args.condition, degraded_dir=args.degraded_dir, ground_truth_dir=args.ground_truth_dir)
        else:
            print("Please specify either (--degraded-dir and --ground-truth-dir) OR (--degraded-image and --ground-truth-image)")
