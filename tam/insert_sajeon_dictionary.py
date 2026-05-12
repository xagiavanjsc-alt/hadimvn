"""
Insert 사전 (辭典 - dictionary) with unique slug sa-jeon-2
"""
import requests
import json

data = {
    'id': 2365,
    'hangul': '사전',
    'hanja': '辭典',
    'slug': 'sa-jeon-2',
    'meaning_vn': 'Từ điển',
    'hanja_breakdown': [
        {'char': '辭', 'meaning': 'Từ', 'reading': ''},
        {'char': '典', 'meaning': 'Sách', 'reading': ''}
    ],
    'examples': [
        {'ko': '한국어 사전을 찾아봤어요.', 'boi': 'han-gu-geo sa-jeo-neul cha-ja-bwa-sseo-yo', 'vi': 'Tôi đã tra từ điển tiếng Hàn.'},
        {'ko': '이 단어의 뜻을 사전에서 확인하세요.', 'boi': 'i da-neo-ui tteu-seul sa-jeo-e-seo hwa-gin-ha-se-yo', 'vi': 'Hãy xác nhận nghĩa của từ này trong từ điển.'},
        {'ko': '사전에 등재된 표준어입니다.', 'boi': 'sa-jeo-e deung-jae-doen pyo-ju-neo-im-ni-da', 'vi': 'Đây là từ tiêu chuẩn được đăng ký trong từ điển.'},
        {'ko': '디지털 사전이 더 편리해요.', 'boi': 'di-ji-teol sa-jeo-ni deo pyeol-li-hae-yo', 'vi': 'Từ điển kỹ thuật số tiện lợi hơn.'},
        {'ko': '사전 준비가 중요합니다.', 'boi': 'sa-jeon jun-bi-ga jung-yo-ham-ni-da', 'vi': 'Chuẩn bị trước là quan trọng.'},
        {'ko': '그 일은 사전에 방지해야 합니다.', 'boi': 'geu i-reun sa-jeo-ne bang-ji-hae-ya ham-ni-da', 'vi': 'Công việc đó phải được ngăn chặn từ trước.'}
    ],
    'related_words': [
        {'word': '백과사전', 'hanja': '百科辭典', 'meaning': 'Bách khoa toàn thư'},
        {'word': '국어사전', 'hanja': '國語辭典', 'meaning': 'Từ điển quốc ngữ'},
        {'word': '영한사전', 'hanja': '英韓辭典', 'meaning': 'Từ điển Anh-Hàn'},
        {'word': '한영사전', 'hanja': '韓英辭典', 'meaning': 'Từ điển Hàn-Anh'}
    ],
    'mnemonic': '',
    'raw': '''## 사전 (辭典)

1. GIẢI NGHĨA: Nghĩa tiếng Việt là "từ điển". Gốc Hán: từ (辭), chữ (辭), điển (典), sách (典).

2. 6 VÍ DỤ THỰC CHIẾN:
+ Hàn: 한국어 사전을 찾아봤어요.
+ Bồi: han-gu-geo sa-jeo-neul cha-ja-bwa-sseo-yo
  + Việt: Tôi đã tra từ điển tiếng Hàn.

+ Hàn: 이 단어의 뜻을 사전에서 확인하세요.
+ Bồi: i da-neo-ui tteu-seul sa-jeo-e-seo hwa-gin-ha-se-yo
  + Việt: Hãy xác nhận nghĩa của từ này trong từ điển.

+ Hàn: 사전에 등재된 표준어입니다.
+ Bồi: sa-jeo-e deung-jae-doen pyo-ju-neo-im-ni-da
  + Việt: Đây là từ tiêu chuẩn được đăng ký trong từ điển.

+ Hàn: 디지털 사전이 더 편리해요.
+ Bồi: di-ji-teol sa-jeo-ni deo pyeol-li-hae-yo
  + Việt: Từ điển kỹ thuật số tiện lợi hơn.

+ Hàn: 사전 준비가 중요합니다.
+ Bồi: sa-jeon jun-bi-ga jung-yo-ham-ni-da
  + Việt: Chuẩn bị trước là quan trọng.

+ Hàn: 그 일은 사전에 방지해야 합니다.
+ Bồi: geu i-reun sa-jeo-ne bang-ji-hae-ya ham-ni-da
  + Việt: Công việc đó phải được ngăn chặn từ trước.

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - 백과사전 (百科辭典): Bách khoa toàn thư.
   - 국어사전 (國語辭典): Từ điển quốc ngữ.
   - 영한사전 (英韓辭典): Từ điển Anh-Hàn.
   - 한영사전 (韓英辭典): Từ điển Hàn-Anh.

4. MẸO NHỚ:
   사전 (辭典) - Từ điển chứa các từ ngữ.'''
}

url = 'https://dcjofhkdrgbrowabudyt.supabase.co/rest/v1/hanja_pro'
headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=ignore-duplicates'
}

r = requests.post(url, json=data, headers=headers)
print(f'Status: {r.status_code}')
print(f'Response: {r.text}')
