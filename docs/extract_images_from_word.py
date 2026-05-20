from docx import Document
from docx.oxml.ns import qn
import os
import shutil
from PIL import Image
import io

def extract_images_from_docx(docx_path, output_dir):
    """Extract images from Word document and save to output directory"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    doc = Document(docx_path)
    image_count = 0
    
    # Extract images from document
    for rel in doc.part.rels.values():
        if "image" in rel.target_ref:
            image_data = rel.target_part.blob
            
            # Get image extension
            image_ext = rel.target_ref.split('.')[-1]
            
            # Save original image
            image_filename = f"image_{image_count + 1}.{image_ext}"
            image_path = os.path.join(output_dir, image_filename)
            
            with open(image_path, 'wb') as f:
                f.write(image_data)
            
            print(f"Extracted: {image_filename}")
            image_count += 1
    
    print(f"\nTotal images extracted: {image_count}")
    print(f"Saved to: {output_dir}")
    
    return image_count

def convert_to_webp(input_dir, output_dir, quality=85):
    """Convert all images in directory to WebP format"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    converted_count = 0
    
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            input_path = os.path.join(input_dir, filename)
            
            # Open image
            with Image.open(input_path) as img:
                # Convert to WebP
                webp_filename = os.path.splitext(filename)[0] + '.webp'
                webp_path = os.path.join(output_dir, webp_filename)
                
                # Save as WebP
                img.save(webp_path, 'webp', quality=quality)
                
                # Get file sizes
                original_size = os.path.getsize(input_path)
                webp_size = os.path.getsize(webp_path)
                savings = (1 - webp_size / original_size) * 100
                
                print(f"Converted: {filename} -> {webp_filename} (saved {savings:.1f}%)")
                converted_count += 1
    
    print(f"\nTotal images converted: {converted_count}")
    print(f"Saved to: {output_dir}")
    
    return converted_count

if __name__ == "__main__":
    docx_path = r"C:\Users\hi\Desktop\code\han\docs\ĐỀ 1 - 6_30 ĐỀ EPS SÁCH MỚI_KTS.docx"
    
    # Extract images
    original_dir = r"C:\Users\hi\Desktop\code\han\docs\eps_images_original"
    webp_dir = r"C:\Users\hi\Desktop\code\han\docs\eps_images_webp"
    
    print("Extracting images from Word document...")
    extract_images_from_docx(docx_path, original_dir)
    
    print("\nConverting images to WebP...")
    convert_to_webp(original_dir, webp_dir)
    
    print("\nNext step: Copy WebP images to public/images/eps/")
