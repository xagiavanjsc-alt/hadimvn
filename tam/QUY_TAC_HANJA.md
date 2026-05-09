# QUY TẮC VIẾT NỘI DUNG HÁN HÀN — CHUẨN CUỐI CÙNG

> Áp dụng cho tất cả các file `Phan_XXX.md`. Không sửa mãi. Làm đúng 1 lần duy nhất.

---

## 1. CẤU TRÚC FILE (.md)

Mỗi từ vựng theo đúng 5 phần theo thứ tự:

```markdown
## hangul (hanja)

1. GIẢI NGHĨA: Nghĩa tiếng Việt là "Viết hoa đầu câu, còn lại thường". Giải thích gốc Hán chi tiết.

2. 6 VÍ DỤ THỰC CHIẾN:
+ Hàn: Câu tiếng Hàn
+ Bồi: Phiên âm bồi
   + Việt: Nghĩa tiếng Việt

+ Hàn: Câu tiếng Hàn
+ Bồi: Phiên âm bồi
   + Việt: Nghĩa tiếng Việt

...(đúng 6 ví dụ, không 5 không 7)

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - từ1 (hán tự): Nghĩa tiếng Việt
   - từ2 (hán tự): Nghĩa tiếng Việt
   - từ3 (hán tự): Nghĩa tiếng Việt
   - từ4 (hán tự): Nghĩa tiếng Việt

4. MẸO NHỚ: Viết mẹo nhớ bằng tiếng Việt, có thể dùng ngoặc kép cho âm Hàn.
```

---

## 2. QUY TẮC VIẾT HOA TIẾNG VIỆT (BẤT DI BẤT DỊCH)

**Chỉ viết hoa chữ cái đầu của mỗi câu. Tất cả chữ cái sau viết thường.**

✅ Đúng:
- `Nghĩa tiếng Việt là "thông qua"`
- `Tranh chấp, tranh giành`
- `Hòa giải, giải hòa`
- `Giải quyết xung đột quan trọng hơn là tránh né nó.`

❌ Sai:
- `Nghĩa Tiếng Việt Là "Thông Qua"` (viết hoa giữa câu)
- `"Tranh chấp, tranh giành"` (có dấu ngoặc kép bao nghĩa)
- `Giải Quyết Xung Đột` (viết hoa giữa câu)

### 2.1. Các phần áp dụng quy tắc viết hoa:
| Phần | Quy tắc |
|------|---------|
| `1. GIẢI NGHĨA` | Chữ đầu câu viết hoa. Chữ trong ngoặc kép `""` viết thường. |
| `2. VÍ DỤ` — dòng Việt | Chữ đầu câu viết hoa, còn lại thường. |
| `3. TỪ LIÊN QUAN` — nghĩa | Không có dấu `"`. Chữ đầu viết hoa, còn lại thường. |
| `4. MẸO NHỚ` | Chữ đầu câu viết hoa. Tên riêng trong ngoặc kép giữ nguyên. |

---

## 3. NHỮNG THỨ CẤM KỴ (KHÔNG ĐƯỢC XUẤT HIỆN)

| Cấm | Lý do | Hậu quả nếu có |
|-----|-------|----------------|
| `---` (3 dấu gạch ngang) | Trình parse nhầm là separator | Mất nội dung phần MẸO NHỚ |
| `**` (bold) trong tiếng Việt | Làm rối parser, sai định dạng | Upload lỗi, hiển thị sai |
| Dấu `"` quanh nghĩa từ liên quan | Parser không nhận diện được | Mất hết từ liên quan trong DB |
| Viết hoa giữa câu | Không đúng quy tắc tiếng Việt | Web hiển thị lộn xộn |

✅ Chỉ được dùng `**` cho từ tiếng Hàn trong phần VÍ DỤ (ví dụ: `**가결**`)

---

## 4. VÍ DỤ MẪU CHUẨN (COPY PASTE ĐỂ LÀM THEO)

```markdown
## 갈등 (葛藤)

1. GIẢI NGHĨA: Nghĩa tiếng Việt là "xung đột, mâu thuẫn". "葛" (갈, cát) là cây nho dại leo quấn; "藤" (등, đằng) là dây leo. Hợp lại chỉ sự rối rắm, quấn vào nhau như dây leo, nghĩa bóng là xung đột, mâu thuẫn.

2. 6 VÍ DỤ THỰC CHIẾN:
+ Hàn: 두 팀 사이의 갈등이 심화되고 있다.
+ Bồi: Du teum sa-i-ui gal-deung-i sim-hwa-do-go it-da.
   + Việt: Xung đột giữa hai đội đang trở nên trầm trọng hơn.

+ Hàn: 가족 갈등을 어떻게 해결할 수 있을까요?
+ Bồi: Ga-jok gal-deung-eul eo-tteo-ke gyeol-hae-hal su i-sseul-kka-yo?
   + Việt: Làm thế nào để giải quyết mâu thuẫn gia đình?

+ Hàn: 정치적 갈등이 사회를 분열시키고 있다.
+ Bồi: Jeong-chi-jeok gal-deung-i sa-hoe-reul bun-yeol-si-ki-go it-da.
   + Việt: Xung đột chính trị đang chia rẽ xã hội.

+ Hàn: 갈등을 피하는 것보다 해결하는 것이 중요하다.
+ Bồi: Gal-deung-eul pi-ha-neun geot-bo-da gyeol-ha-neun geot-i jung-yo-ha-da.
   + Việt: Giải quyết xung đột quan trọng hơn là tránh né nó.

+ Hàn: 이 문제는 갈등의 근원이 무엇인지 파악해야 한다.
+ Bồi: I mun-je-neun gal-deung-ui geun-won-i mu-eo-sin-ji pa-ak-hae-ya han-da.
   + Việt: Vấn đề này cần xác định nguồn gốc của xung đột.

+ Hàn: 갈등 상황에서 중재자의 역할이 중요하다.
+ Bồi: Gal-deung sang-hwang-e-seo jung-je-ja-ui yeok-hal-i jung-yo-ha-da.
   + Việt: Vai trò của người hòa giải trong tình huống xung đột là quan trọng.

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - 분쟁 (紛爭): Tranh chấp, tranh giành
   - 대립 (對立): Đối lập, đối đầu
   - 화해 (和解): Hòa giải, giải hòa
   - 중재 (仲栽): Trung tài, hòa giải

4. MẸO NHỚ: Hãy tưởng tượng hai dây leo "CÁT" (갈) và "ĐẰNG" (등) quấn chặt vào nhau, giống như hai bên đang xung đột không ai chịu nhường ai. Muốn tách ra phải cắt từng sợi một.
```

---

## 5. QUY TẮC TẠO PHẦN MỚI

Mỗi phần gồm **21 từ**, ID liên tiếp:

| Phần | ID | File |
|------|-----|------|
| Phan 001 | 100 – 120 | `Phan_001.md` |
| Phan 002 | 121 – 141 | `Phan_002.md` |
| Phan 003 | 142 – 162 | `Phan_003.md` |
| Phan 004 | 163 – 183 | `Phan_004.md` |
| Phan 005 | 184 – 204 | `Phan_005.md` |

Số thứ tự trên web tự động tính: `#N = ID - 99`
- ID 163 → #64
- ID 200 → #101

---

## 6. CHECKLIST TRƯỚC KHI GỬI FILE

- [ ] Đúng 21 từ
- [ ] Mỗi từ đúng 6 ví dụ
- [ ] Mỗi từ đúng 4 từ liên quan
- [ ] Không có `---` trong file
- [ ] Không có `**` trong tiếng Việt (trừ phần Hàn trong ví dụ)
- [ ] Không có dấu `"` quanh nghĩa từ liên quan
- [ ] Chỉ viết hoa chữ cái đầu mỗi câu tiếng Việt
- [ ] Tất cả nghĩa tiếng Việt viết hoa đầu câu, còn lại thường
