"""Check Apify run status and get results"""
import requests
import json
import time

APIFY_API_KEY = os.getenv("APIFY_API_KEY")

def check_run_status(run_id):
    """Check status of an Apify run"""
    url = f"https://api.apify.com/v2/actor-runs/{run_id}"
    headers = {
        "Authorization": f"Bearer {APIFY_API_KEY}"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error checking status: {response.status_code}")
        return None

def get_run_results(run_id):
    """Get results from completed run"""
    url = f"https://api.apify.com/v2/actor-runs/{run_id}/dataset/items"
    headers = {
        "Authorization": f"Bearer {APIFY_API_KEY}"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error getting results: {response.status_code}")
        return None

def run_and_get_results(actor_id, payload, output_file):
    """Run actor and wait for results"""
    # Start run
    url = f"https://api.apify.com/v2/acts/{actor_id}/runs"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {APIFY_API_KEY}"
    }
    
    print(f"Starting run for {actor_id}...")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code not in [201, 200]:
        print(f"Failed to start run: {response.status_code} - {response.text}")
        return None
    
    run_data = response.json()
    run_id = run_data['id']
    print(f"Run ID: {run_id}")
    
    # Poll for completion
    while True:
        status = check_run_status(run_id)
        if not status:
            break
            
        state = status.get('data', {}).get('status', 'UNKNOWN')
        print(f"Status: {state}")
        
        if state == 'SUCCEEDED':
            print("Run completed successfully!")
            results = get_run_results(run_id)
            if results:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)
                print(f"Saved {len(results)} items to {output_file}")
                return results
            break
        elif state == 'FAILED':
            print("Run failed!")
            print(status.get('data', {}).get('statusMessage', 'Unknown error'))
            break
        elif state in ['RUNNING', 'READY']:
            print("Still running...")
            time.sleep(5)
        else:
            print(f"Unknown status: {state}")
            time.sleep(5)
    
    return None

if __name__ == "__main__":
    # Fetch Melon data
    print("=== Fetching Melon Chart ===")
    melon_results = run_and_get_results(
        "oxygenated_quagmire/melon-chart-scraper",
        {"mode": "top100", "maxResults": 200},
        "melon_real_data.json"
    )
    
    # Fetch Naver KiN data
    print("\n=== Fetching Naver KiN ===")
    keywords = ["한국어 공부", "한국어 학습", "한국어 질문", "한국어 문법"]
    all_qa = []
    
    for keyword in keywords:
        print(f"\nFetching for keyword: {keyword}")
        results = run_and_get_results(
            "oxygenated_quagmire/naver-kin-scraper",
            {"query": keyword, "maxItems": 20, "sortBy": "accuracy"},
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
    
    # Combine all Naver KiN results
    if all_qa:
        with open("naver_kin_real_data.json", 'w', encoding='utf-8') as f:
            json.dump(all_qa, f, ensure_ascii=False, indent=2)
        print(f"\nCombined {len(all_qa)} Q&A into naver_kin_real_data.json")
    
    print("\nDone!")
