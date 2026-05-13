"""
Script to convert between JSON and Markdown formats
- JSON → Markdown: For manual editing
- Markdown → JSON: For web app deployment

Usage:
  # Convert JSON to Markdown (for editing)
  python scripts/convert_data.py --to-markdown --input src/mocks/melonSongs_real.json --output src/mocks/melonSongs.md
  
  # Convert Markdown to JSON (for deployment)
  python scripts/convert_data.py --to-json --input src/mocks/melonSongs.md --output src/mocks/melonSongs_real.json
"""

import json
import argparse
from typing import List, Dict

def melon_json_to_markdown(json_file: str, md_file: str):
    """Convert Melon JSON to Markdown format"""
    
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    with open(md_file, "w", encoding="utf-8") as f:
        f.write("# Melon Chart Data\n\n")
        f.write(f"Total: {len(data)} songs\n\n")
        f.write("---\n\n")
        
        for item in data:
            f.write(f"## Song {item.get('rank', 'N/A')}\n\n")
            f.write(f"- **Rank**: {item.get('rank', 'N/A')}\n")
            f.write(f"- **Title**: {item.get('title', 'N/A')}\n")
            f.write(f"- **Artist**: {item.get('artist', 'N/A')}\n")
            f.write(f"- **Genre**: {item.get('genre', 'N/A')}\n")
            f.write(f"- **Album**: {item.get('album', 'N/A')}\n")
            f.write(f"- **Release Date**: {item.get('releaseDate', 'N/A')}\n")
            f.write(f"- **Album Art**: {item.get('albumArt', 'N/A')}\n")
            f.write(f"- **Processed**: {item.get('processed', False)}\n")
            f.write(f"- **Lyrics**: {item.get('lyrics', 'N/A')}\n")
            f.write("\n---\n\n")
    
    print(f"✅ Converted {len(data)} songs from JSON to Markdown: {md_file}")

def melon_markdown_to_json(md_file: str, json_file: str):
    """Convert Melon Markdown to JSON format"""
    
    with open(md_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    songs = []
    current_song = {}
    current_field = None
    
    for line in content.split('\n'):
        line = line.strip()
        
        if line.startswith('## Song'):
            # Save previous song
            if current_song:
                songs.append(current_song)
            # Start new song
            current_song = {"rank": int(line.split()[-1])}
            current_field = None
        elif line.startswith('- **'):
            # Parse field
            if '**' in line:
                parts = line.split('**')
                field_name = parts[1].strip()
                field_value = parts[2].strip(': ').strip()
                current_song[field_name.lower().replace(' ', '_')] = field_value
            current_field = None
        elif line.startswith('- **Lyrics**'):
            current_field = 'lyrics'
        elif current_field == 'lyrics':
            if line.startswith('---'):
                current_field = None
            elif current_song.get('lyrics'):
                current_song['lyrics'] += ' ' + line
            else:
                current_song['lyrics'] = line
    
    # Save last song
    if current_song:
        songs.append(current_song)
    
    # Convert types
    for song in songs:
        song['rank'] = int(song.get('rank', 0))
        song['processed'] = song.get('processed', 'false').lower() == 'true'
    
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Converted {len(songs)} songs from Markdown to JSON: {json_file}")

def naver_json_to_markdown(json_file: str, md_file: str):
    """Convert Naver KiN JSON to Markdown format"""
    
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    with open(md_file, "w", encoding="utf-8") as f:
        f.write("# Naver KiN Q&A Data\n\n")
        f.write(f"Total: {len(data)} Q&A items\n\n")
        f.write("---\n\n")
        
        for item in data:
            f.write(f"## Q&A {item.get('id', 'N/A')}\n\n")
            f.write(f"- **ID**: {item.get('id', 'N/A')}\n")
            f.write(f"- **Question**: {item.get('question', 'N/A')}\n")
            f.write(f"- **Answer**: {item.get('answer', 'N/A')}\n")
            f.write(f"- **Category**: {item.get('category', 'N/A')}\n")
            f.write(f"- **Likes**: {item.get('likes', 0)}\n")
            f.write(f"- **Views**: {item.get('views', 0)}\n")
            f.write(f"- **URL**: {item.get('url', 'N/A')}\n")
            f.write("\n---\n\n")
    
    print(f"✅ Converted {len(data)} Q&A items from JSON to Markdown: {md_file}")

def naver_markdown_to_json(md_file: str, json_file: str):
    """Convert Naver KiN Markdown to JSON format"""
    
    with open(md_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    qas = []
    current_qa = {}
    
    for line in content.split('\n'):
        line = line.strip()
        
        if line.startswith('## Q&A'):
            # Save previous QA
            if current_qa:
                qas.append(current_qa)
            # Start new QA
            current_qa = {"id": int(line.split()[-1])}
        elif line.startswith('- **'):
            # Parse field
            if '**' in line:
                parts = line.split('**')
                field_name = parts[1].strip()
                field_value = parts[2].strip(': ').strip()
                current_qa[field_name.lower()] = field_value
    
    # Save last QA
    if current_qa:
        qas.append(current_qa)
    
    # Convert types
    for qa in qas:
        qa['id'] = int(qa.get('id', 0))
        qa['likes'] = int(qa.get('likes', 0))
        qa['views'] = int(qa.get('views', 0))
    
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(qas, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Converted {len(qas)} Q&A items from Markdown to JSON: {json_file}")

def main():
    parser = argparse.ArgumentParser(description='Convert between JSON and Markdown formats')
    parser.add_argument('--to-markdown', action='store_true', help='Convert JSON to Markdown')
    parser.add_argument('--to-json', action='store_true', help='Convert Markdown to JSON')
    parser.add_argument('--input', required=True, help='Input file path')
    parser.add_argument('--output', required=True, help='Output file path')
    parser.add_argument('--type', choices=['melon', 'naver'], required=True, help='Data type')
    
    args = parser.parse_args()
    
    if args.to_markdown:
        if args.type == 'melon':
            melon_json_to_markdown(args.input, args.output)
        else:
            naver_json_to_markdown(args.input, args.output)
    elif args.to_json:
        if args.type == 'melon':
            melon_markdown_to_json(args.input, args.output)
        else:
            naver_markdown_to_json(args.input, args.output)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
