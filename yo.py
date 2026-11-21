
import os
import shutil

clear_dir = r"D:\leftImg8bit_trainvaltest\leftImg8bit\train\jena"
rainy_dir = r"D:\leftImg8bit_trainval_rain\leftImg8bit_rain\train\jena"

output_dir = r"D:\RainCityscapes_All_Patterns"

clear_output = os.path.join(output_dir, "clear")
rainy_output = os.path.join(output_dir, "rainy")

os.makedirs(clear_output, exist_ok=True)
os.makedirs(rainy_output, exist_ok=True)

extensions = (".png", ".jpg", ".jpeg")

# Load clear images
clear_images = {
    os.path.splitext(f)[0]: f
    for f in os.listdir(clear_dir)
    if f.lower().endswith(extensions)
}

# Load rainy images
rainy_images = sorted([
    f for f in os.listdir(rainy_dir)
    if f.lower().endswith(extensions)
])

pair_count = 9223
matched_clear = set()

for rainy_filename in rainy_images:

    rainy_stem = os.path.splitext(rainy_filename)[0]

    # Extract original clear image name
    clear_stem = rainy_stem.split("_rain_")[0]

    if clear_stem not in clear_images:
        continue

    clear_filename = clear_images[clear_stem]

    pair_count += 1

    # Short sequential filename
    new_name = f"{pair_count:06d}.png"

    # Copy clear image
    shutil.copy2(
        os.path.join(clear_dir, clear_filename),
        os.path.join(clear_output, new_name)
    )

    # Copy rainy image
    shutil.copy2(
        os.path.join(rainy_dir, rainy_filename),
        os.path.join(rainy_output, new_name)
    )

    matched_clear.add(clear_stem)

print("\n========== DATASET SUMMARY ==========")
print("Total clear images:", len(clear_images))
print("Total rainy images:", len(rainy_images))
print("Unique clear scenes matched:", len(matched_clear))
print("Total paired images:", pair_count)
print("Unmatched rainy images:", len(rainy_images) - pair_count)
print("Output:", output_dir)
print("====================================")
