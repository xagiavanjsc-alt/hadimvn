"""Fetch real Melon data from API"""
import requests
import json
import os

APIFY_API_KEY = os.getenv("APIFY_API_KEY")

def fetch_melon_data():
    """Fetch real Melon chart data from Apify API"""
    url = "https://api.apify.com/v2/acts/oxygenated_quagmire~melon-chart-scraper/run-sync"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {APIFY_API_KEY}"
    }
    payload = {
        "mode": "top100",
        "maxResults": 200
    }
    
    print("Đang fetch dữ liệu Melon Chart...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        
        # Extract songs from API response
        songs = []
        if 'items' in data:
            items = data['items']
            for i, item in enumerate(items[:100], 1):  # Top 100
                song = {
                    "rank": i,
                    "title": item.get('title', ''),
                    "artist": item.get('artist', ''),
                    "genre": item.get('genre', 'K-pop'),
                    "lyrics": item.get('lyrics', ''),
                    "albumArt": item.get('albumArt', ''),
                    "processed": False,
                    "releaseDate": item.get('releaseDate', ''),
                    "album": item.get('album', ''),
                    "translation": {
                        "full": "",
                        "lineByLine": [],
                        "culturalNotes": []
                    },
                    "vocabulary": [],
                    "grammar": [],
                    "difficulty": {
                        "overall": "medium",
                        "vocabulary": 50,
                        "grammar": 50,
                        "speed": 50,
                        "recommendedFor": ["TOPIK 3-4"]
                    }
                }
                songs.append(song)
        
        # Save to file
        output_file = "melon_real_data.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(songs, f, ensure_ascii=False, indent=2)
        
        print(f"Đã fetch và lưu {len(songs)} bài hát vào {output_file}")
        return songs
    else:
        print(f"Lỗi fetch API: {response.status_code} - {response.text}")
        return None

def fetch_naver_kin_data():
    """Fetch real Naver KiN Q&A from API"""
    url = "https://api.apify.com/v2/acts/oxygenated_quagmire~naver-kin-scraper/run-sync"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {APIFY_API_KEY}"
    }
    
    keywords = ["한국어 공부", "한국어 학습", "한국어 질문", "한국어 문법"]
    all_items = []
    
    for keyword in keywords:
        print(f"Đang fetch Naver KiN với keyword: {keyword}")
        payload = {
            "query": keyword,
            "maxItems": 20,
            "sortBy": "accuracy"
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if 'items' in data:
                for item in data['items']:
                    qa_item = {
                        "id": len(all_items) + 1,
                        "question": item.get('question', ''),
                        "question_vi": "",
                        "answer": item.get('answer', ''),
                        "answer_vi": "",
                        "category": "Korean Learning",
                        "likes": item.get('likes', 0),
                        "views": item.get('views', 0),
                        "url": item.get('url', ''),
                        "translated": False,
                        "vocabulary": [],
                        "grammar": [],
                        "difficulty": "2"
                    }
                    all_items.append(qa_item)
        else:
            print(f"Lỗi fetch keyword {keyword}: {response.status_code}")
    
    # Save to file
    output_file = "naver_kin_real_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)
    
    print(f"Đã fetch và lưu {len(all_items)} Q&A vào {output_file}")
    return all_items

if __name__ == "__main__":
    # Fetch Melon data
    melon_songs = fetch_melon_data()
    
    # Fetch Naver KiN data
    naver_qa = fetch_naver_kin_data()
    
    print("\nHoàn thành fetch dữ liệu thật!")
    print(f"- Melon: {len(melon_songs) if melon_songs else 0} bài hát")
    print(f"- Naver KiN: {len(naver_qa) if naver_qa else 0} Q&A")
