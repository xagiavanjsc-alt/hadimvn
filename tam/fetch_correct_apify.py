"""Fetch real data using correct Apify API endpoints"""
import requests
import json
import time

APIFY_API_KEY = os.getenv("APIFY_API_KEY")

def run_actor(actor_id, input_data, output_file):
    """Run Apify actor and get results"""
    # Start run
    url = f"https://api.apify.com/v2/acts/{actor_id}/runs"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {APIFY_API_KEY}"
    }
    
    print(f"Starting actor: {actor_id}")
    response = requests.post(url, headers=headers, json=input_data)
    
    if response.status_code not in [201, 200]:
        print(f"Failed to start: {response.status_code} - {response.text}")
        return None
    
    run_id = response.json()['data']['id']
    print(f"Run ID: {run_id}")
    
    # Wait for completion
    status_url = f"https://api.apify.com/v2/actor-runs/{run_id}"
    
    while True:
        status_response = requests.get(status_url, headers=headers)
        if status_response.status_code == 200:
            status = status_response.json()['data']['status']
            print(f"Status: {status}")
            
            if status == 'SUCCEEDED':
                # Get results
                dataset_url = f"https://api.apify.com/v2/actor-runs/{run_id}/dataset/items"
                results_response = requests.get(dataset_url, headers=headers)
                
                if results_response.status_code == 200:
                    results = results_response.json()
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(results, f, ensure_ascii=False, indent=2)
                    print(f"Saved {len(results)} items to {output_file}")
                    return results
                break
            elif status == 'FAILED':
                print("Run failed!")
                break
            elif status in ['RUNNING', 'READY']:
                time.sleep(5)
            else:
                print(f"Unknown status: {status}")
                time.sleep(5)
    
    return None

def fetch_melon_chart():
    """Fetch Melon chart data"""
    return run_actor(
        "oxygenated_quagmire/melon-chart-scraper",
        {
            "mode": "top100",
            "maxResults": 100
        },
        "melon_chart_real.json"
    )

def fetch_naver_kin():
    """Fetch Naver KiN Q&A"""
    keywords = ["한국어 공부", "한국어 학습"]
    all_qa = []
    
    for keyword in keywords:
        print(f"\nFetching for: {keyword}")
        results = run_actor(
            "oxygenated_quagmire/naver-kin-scraper",
            {
                "query": keyword,
                "maxItems": 10,
                "sortBy": "accuracy"
            },
            f"naver_kin_{keyword.replace(' ', '_')}.json"
        )
        
        if results:
            for item in results:
                qa_item = {
                    "id": len(all_qa) + 1,
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
                all_qa.append(qa_item)
    
    # Save combined results
    if all_qa:
        with open("naver_kin_real_combined.json", 'w', encoding='utf-8') as f:
            json.dump(all_qa, f, ensure_ascii=False, indent=2)
        print(f"\nCombined: {len(all_qa)} Q&A")
    
    return all_qa

if __name__ == "__main__":
    print("=== Fetching Melon Chart ===")
    melon = fetch_melon_chart()
    
    print("\n=== Fetching Naver KiN ===")
    naver = fetch_naver_kin()
    
    print("\nDone!")
