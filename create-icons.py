#!/usr/bin/env python3

import os
from PIL import Image, ImageDraw, ImageFont
import sys

def create_icon(size, filename):
    """Create a simple clock-style icon for the given size"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate dimensions
    center = size // 2
    radius = int(size * 0.4)
    
    # Draw outer circle (clock face)
    draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                 fill=(59, 130, 246, 255), outline=(30, 64, 175, 255), width=max(1, size//32))
    
    # Draw clock hands
    hand_length = radius * 0.7
    # Hour hand (pointing to 3 o'clock)
    draw.line([center, center, center + hand_length * 0.6, center], 
              fill=(255, 255, 255, 255), width=max(2, size//16))
    # Minute hand (pointing to 12 o'clock)
    draw.line([center, center, center, center - hand_length], 
              fill=(255, 255, 255, 255), width=max(1, size//24))
    
    # Draw center dot
    dot_radius = max(2, size//20)
    draw.ellipse([center - dot_radius, center - dot_radius, center + dot_radius, center + dot_radius], 
                 fill=(255, 255, 255, 255))
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Icon sizes needed for Safari extension
    sizes = [
        (16, 'icons/icon-16.png'),
        (32, 'icons/icon-32.png'),
        (48, 'icons/icon-48.png'),
        (128, 'icons/icon-128.png'),
        (128, 'icons/Icon.png')  # Additional Icon.png that Xcode needs
    ]
    
    try:
        for size, filename in sizes:
            create_icon(size, filename)
        print("✅ All icons created successfully!")
        return 0
    except ImportError:
        print("❌ PIL (Pillow) not found. Installing...")
        os.system("pip3 install Pillow")
        try:
            from PIL import Image, ImageDraw
            for size, filename in sizes:
                create_icon(size, filename)
            print("✅ All icons created successfully!")
            return 0
        except Exception as e:
            print(f"❌ Error creating icons: {e}")
            return 1
    except Exception as e:
        print(f"❌ Error creating icons: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())