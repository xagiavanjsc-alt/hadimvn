"""Load sample data into admin panel localStorage format"""
import json
import os

def load_melon_sample():
    """Load Melon sample data and format for localStorage"""
    sample_file = "../src/mocks/melon_sample_data.json"
    
    if os.path.exists(sample_file):
        with open(sample_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Save in format for admin panel
        output = {
            "kts_melon_songs": data
        }
        
        with open("melon_for_admin.json", 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"Loaded {len(data)} Melon songs for admin panel")
        return data
    else:
        print("Sample file not found")
        return None

def load_naver_sample():
    """Load Naver KiN sample data and format for localStorage"""
    sample_file = "../src/mocks/naver_kin_sample_data.json"
    
    if os.path.exists(sample_file):
        with open(sample_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Save in format for admin panel
        output = {
            "kts_naver_kin_qa": data
        }
        
        with open("naver_kin_for_admin.json", 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        print(f"Loaded {len(data)} Naver KiN Q&A for admin panel")
        return data
    else:
        print("Sample file not found")
        return None

if __name__ == "__main__":
    print("Loading sample data for admin panel...")
    
    melon = load_melon_sample()
    naver = load_naver_sample()
    
    print("\nReady to upload to admin panel!")
    print("Files created:")
    print("- melon_for_admin.json")
    print("- naver_kin_for_admin.json")
