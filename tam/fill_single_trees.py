"""
fill_single_trees.py
Them 3 tu moi cho moi cay chi co 1 tu trong hanja_tree_nodes
Resume-safe: chi insert neu cay van con < 2 tu
"""
import requests, openai, json, re, time
from itertools import cycle

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = [
    "fw_9CHLzUZFn12yKrdLgCXnxq",  # key cua user
]
TIMEOUT = 90

key_cycle = cycle(API_KEYS)

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }

# ─── Lay cac cay chi co 1 tu ─────────────────────────────────────────────────
def fetch_single_trees():
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
        f"?select=korean,hanja,vietnamese,root_char,root_meaning,pronunciation,category,difficulty,level"
        f"&limit=10000",
        headers=get_headers(), timeout=30
    )
    nodes = r.json()
    from collections import Counter
    counts = Counter(n["root_char"] for n in nodes)
    # Lay 1 dai dien cho moi cay 1 tu
    seen = set()
    singles = []
    for n in nodes:
        rc = n["root_char"]
        if counts[rc] == 1 and rc not in seen:
            seen.add(rc)
            singles.append(n)
    return singles

# ─── AI sinh 3 tu moi cung goc ───────────────────────────────────────────────
def ai_generate_words(existing_node):
    root = existing_node["root_char"]
    root_meaning = existing_node.get("root_meaning", "")
    example = existing_node["korean"]
    hanja = existing_node["hanja"]
    viet = existing_node["vietnamese"]
    cat = existing_node.get("category", "Khác")
    diff = existing_node.get("difficulty", 2)
    level = existing_node.get("level", 1)

    system = "Tra ve JSON array thuan tuy. KHONG giai thich. Chi JSON."

    prompt = f"""Chu Han goc: {root} (am Han-Viet: {root_meaning})
Vi du hien co: {example} ({hanja}) = {viet}

Hay tao them 3 tu tieng Han-Quoc KHAC nhau co chua chu Han {root}, moi tu la 1 phan tu JSON:
{{"korean":"tu tieng Han","hanja":"chu Han","vietnamese":"nghia tieng Viet","pronunciation":"phat am La-tinh","root_char":"{root}","root_meaning":"{root_meaning}","category":"{cat}","difficulty":{diff},"level":{level},"examples":[{{"korean":"cau vi du","vietnamese":"nghia","pronunciation":"phat am"}}],"memory_tip":"meo nho 1 cau","related_words":[{{"word":"tu lq","meaning":"nghia"}}],"meaning_detail":"phan tich chu Han"}}

Tra ve JSON array 3 phan tu. Chi JSON, khong them gi khac."""

    for attempt in range(len(API_KEYS)):
        key = next(key_cycle)
        client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=key, timeout=TIMEOUT
        )
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user",   "content": prompt}
                ],
                temperature=0.4,
                max_tokens=2500,
                timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            raw = re.sub(r'```(?:json)?', '', text).strip('`').strip()
            # Try full array
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                try:
                    result = json.loads(match.group())
                    if isinstance(result, list) and len(result) >= 1:
                        return result[:3]
                except json.JSONDecodeError:
                    pass
            # Depth tracking fallback
            parsed = []
            depth = 0
            start = -1
            for ci, ch in enumerate(raw):
                if ch == '{' and depth == 0:
                    start = ci; depth = 1
                elif ch == '{' and depth > 0:
                    depth += 1
                elif ch == '}' and depth == 1:
                    depth = 0
                    try: parsed.append(json.loads(raw[start:ci+1]))
                    except: pass
                elif ch == '}' and depth > 1:
                    depth -= 1
            if parsed:
                return parsed[:3]
        except Exception as e:
            err = str(e)[:100]
            if "suspended" in err or "412" in err:
                print(f"  Key [suspended]", flush=True)
            else:
                print(f"  Loi: {err}", flush=True)
                time.sleep(3)
    return []

# ─── Insert vao Supabase ─────────────────────────────────────────────────────
def insert_words(words: list):
    if not words:
        return 0
    # Clean and validate
    cleaned = []
    for w in words:
        if not w.get("korean") or not w.get("hanja") or not w.get("vietnamese"):
            continue
        cleaned.append({
            "korean":        w.get("korean", ""),
            "hanja":         w.get("hanja", ""),
            "vietnamese":    w.get("vietnamese", ""),
            "pronunciation": w.get("pronunciation", ""),
            "root_char":     w.get("root_char", ""),
            "root_meaning":  w.get("root_meaning", ""),
            "category":      w.get("category", "Khác"),
            "difficulty":    int(w.get("difficulty") or 2),
            "level":         int(w.get("level") or 1),
            "examples":      w.get("examples", []),
            "memory_tip":    w.get("memory_tip", ""),
            "related_words": w.get("related_words", []),
            "meaning_detail":w.get("meaning_detail", ""),
            "hanja_chars":   [],
        })
    if not cleaned:
        return 0
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes",
        headers={**get_headers(), "Prefer": "return=minimal"},
        json=cleaned, timeout=20
    )
    return len(cleaned) if r.status_code in (200, 201) else 0

# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    print("=== fill_single_trees: Them tu moi cho cay 1 tu ===", flush=True)
    singles = fetch_single_trees()
    print(f"So cay can bo sung: {len(singles)}", flush=True)

    total_inserted = 0
    for i, node in enumerate(singles):
        root = node["root_char"]
        print(f"  [{i+1}/{len(singles)}] {root}: {node['korean']} ({node['hanja']}) ...", flush=True, end=" ")

        new_words = ai_generate_words(node)
        if not new_words:
            print("⚠️  AI tra ve rong", flush=True)
            continue

        n = insert_words(new_words)
        total_inserted += n
        words_str = ", ".join(w.get("korean","?") for w in new_words[:n])
        print(f"✅ +{n} tu: {words_str}", flush=True)
        time.sleep(0.5)

    print(f"\n✅ HOAN THANH! Tong cong them {total_inserted} tu moi vao {len(singles)} cay", flush=True)

if __name__ == "__main__":
    main()
