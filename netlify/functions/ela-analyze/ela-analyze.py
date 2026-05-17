import json
import base64
import io
import math
import os
from PIL import Image, ImageChops, ImageEnhance

def handler(event, context):
    """
    Netlify Python Function handler.
    Accepts: { "image_base64": "..." }
    Returns: ELA analysis result
    """
    try:
        if event.get("httpMethod") != "POST":
            return {
                "statusCode": 405,
                "body": json.dumps({"error": "Method not allowed"})
            }

        body = json.loads(event.get("body", "{}"))
        image_base64 = body.get("image_base64")

        if not image_base64:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "image_base64 is required"})
            }

        # Decode base64 to image
        image_data = base64.b64decode(image_base64)
        original = Image.open(io.BytesIO(image_data)).convert("RGB")

        # Run ELA at multiple quality levels for better accuracy
        results = []
        for quality in [70, 80, 90]:
            ela_result = run_ela(original, quality)
            results.append(ela_result)

        # Take the most suspicious result
        best_result = max(results, key=lambda r: r["manipulation_score"])

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(best_result)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e), "manipulation_score": 0})
        }


def run_ela(original: Image.Image, quality: int = 80) -> dict:
    """
    Core ELA algorithm:
    1. Re-save the image at a specific JPEG quality
    2. Compute pixel-level difference between original and re-saved
    3. Amplify the difference to make edits visible
    4. Analyze the amplified image for suspicious high-error regions
    """
    # Step 1: Re-save at reduced quality
    buffer = io.BytesIO()
    original.save(buffer, format="JPEG", quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer).convert("RGB")

    # Step 2: Get pixel difference
    diff = ImageChops.difference(original, resaved)

    # Step 3: Amplify the difference
    # Scale factor: higher = more sensitive, more false positives
    # 10x is the standard for forensics work
    extrema = diff.getextrema()
    max_diff = max([ex[1] for ex in extrema]) if extrema else 1
    if max_diff == 0:
        max_diff = 1
    scale = 255.0 / max_diff * 10
    
    enhancer = ImageEnhance.Brightness(diff)
    ela_image = enhancer.enhance(scale)

    # Step 4: Analyze the ELA result
    analysis = analyze_ela_image(ela_image, original.size)
    analysis["quality_used"] = quality

    return analysis


def analyze_ela_image(ela_image: Image.Image, original_size: tuple) -> dict:
    """
    Analyze the ELA result image for signs of manipulation.
    
    Key insight: In an authentic image, all regions should have
    SIMILAR error levels after re-compression. Pasted/edited regions
    will have HIGHER error levels (brighter in ELA) than the rest.
    
    We look for:
    - Regions with significantly higher brightness than the image average
    - Sharp boundaries between high-error and low-error regions
    - Isolated bright patches (typical of pasted text/numbers)
    """
    width, height = ela_image.size
    pixels = list(ela_image.getdata())

    # Calculate brightness of each pixel
    # Brightness = average of R, G, B channels
    brightness_values = [
        (r + g + b) / 3
        for r, g, b in pixels
    ]

    avg_brightness = sum(brightness_values) / len(brightness_values)
    
    # Standard deviation
    variance = sum((b - avg_brightness) ** 2 for b in brightness_values) / len(brightness_values)
    std_dev = math.sqrt(variance)

    # Pixels significantly brighter than average are suspicious
    # Threshold: mean + 2.5 standard deviations
    threshold = avg_brightness + (2.5 * std_dev)
    
    suspicious_pixels = [
        i for i, b in enumerate(brightness_values)
        if b > threshold
    ]

    suspicious_percentage = (len(suspicious_pixels) / len(pixels)) * 100

    # Find suspicious regions (cluster suspicious pixels into areas)
    suspicious_regions = find_suspicious_regions(
        suspicious_pixels, width, height
    )

    # Calculate manipulation score (0-100)
    # Base score from percentage of suspicious pixels
    # Weight by whether they form coherent regions (editing patterns)
    base_score = min(suspicious_percentage * 8, 60)
    region_bonus = min(len(suspicious_regions) * 10, 40) if suspicious_regions else 0
    manipulation_score = min(int(base_score + region_bonus), 100)

    # Determine verdict
    if manipulation_score < 20:
        verdict = "clean"
    elif manipulation_score < 50:
        verdict = "suspicious"
    else:
        verdict = "tampered"

    return {
        "manipulation_score": manipulation_score,
        "ela_verdict": verdict,
        "avg_brightness": round(avg_brightness, 2),
        "std_deviation": round(std_dev, 2),
        "suspicious_pixel_percentage": round(suspicious_percentage, 2),
        "suspicious_regions": suspicious_regions[:5],  # Top 5 regions
        "region_count": len(suspicious_regions),
    }


def find_suspicious_regions(
    suspicious_pixel_indices: list,
    width: int,
    height: int,
    min_cluster_size: int = 20
) -> list:
    """
    Group suspicious pixels into rectangular regions using a simple
    grid-based clustering approach.
    
    We divide the image into a 10x10 grid and find which grid cells
    have the highest concentration of suspicious pixels.
    """
    if not suspicious_pixel_indices:
        return []

    grid_cols = 10
    grid_rows = 10
    cell_width = width / grid_cols
    cell_height = height / grid_rows

    # Count suspicious pixels per grid cell
    cell_counts = {}
    for idx in suspicious_pixel_indices:
        col = min(int((idx % width) / cell_width), grid_cols - 1)
        row = min(int((idx // width) / cell_height), grid_rows - 1)
        cell_key = (row, col)
        cell_counts[cell_key] = cell_counts.get(cell_key, 0) + 1

    # Find cells with significant concentration
    suspicious_regions = []
    for (row, col), count in cell_counts.items():
        if count >= min_cluster_size:
            # Convert grid coordinates back to pixel coordinates
            x1 = int(col * cell_width)
            y1 = int(row * cell_height)
            x2 = int((col + 1) * cell_width)
            y2 = int((row + 1) * cell_height)
            suspicious_regions.append({
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1,
                "suspicious_pixel_count": count,
                "description": f"High-error region at grid ({row},{col})"
            })

    # Sort by suspicious pixel count (most suspicious first)
    suspicious_regions.sort(
        key=lambda r: r["suspicious_pixel_count"],
        reverse=True
    )

    return suspicious_regions
