#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Phan_003.md with 21 Hanja words (6 examples + 4 related each)"""

WORDS = [
    ("갈등", "葛藤", "xung đột, mâu thuẫn",
     '"葛" (갈, cát) là cây nho dại leo quấn; "藤" (등, đằng) là dây leo. Hợp lại chỉ sự rối rắm, quấn vào nhau như dây leo, nghĩa bóng là xung đột, mâu thuẫn.',
     [
         ("두 팀 사이의 갈등이 심화되고 있다.", "Du teum sa-i-ui gal-deung-i sim-hwa-do-go it-da.", "Xung đột giữa hai đội đang trở nên trầm trọng hơn."),
         ("가족 갈등을 어떻게 해결할 수 있을까요?", "Ga-jok gal-deung-eul eo-tteo-ke gyeol-hae-hal su i-sseul-kka-yo?", "Làm thế nào để giải quyết mâu thuẫn gia đình?"),
         ("정치적 갈등이 사회를 분열시키고 있다.", "Jeong-chi-jeok gal-deung-i sa-hoe-reul bun-yeol-si-ki-go it-da.", "Xung đột chính trị đang chia rẽ xã hội."),
         ("갈등을 피하는 것보다 해결하는 것이 중요하다.", "Gal-deung-eul pi-ha-neun geot-bo-da gyeol-ha-neun geot-i jung-yo-ha-da.", "Giải quyết xung đột quan trọng hơn là tránh né nó."),
         ("이 문제는 갈등의 근원이 무엇인지 파악해야 한다.", "I mun-je-neun gal-deung-ui geun-won-i mu-eo-sin-ji pa-ak-hae-ya han-da.", "Vấn đề này cần xác định nguồn gốc của xung đột."),
         ("갈등 상황에서 중재자의 역할이 중요하다.", "Gal-deung sang-hwang-e-seo jung-je-ja-ui yeok-hal-i jung-yo-ha-da.", "Vai trò của người hòa giải trong tình huống xung đột là quan trọng."),
     ],
     [
         ("분쟁", "紛爭", "tranh chấp, tranh giành"),
         ("대립", "對立", "đối lập, đối đầu"),
         ("화해", "和解", "hòa giải, giải hòa"),
         ("중재", "仲栽", "trung tài, hòa giải"),
     ],
     'Hãy tưởng tượng hai dây leo "CÁT" (갈) và "ĐẰNG" (등) quấn chặt vào nhau, giống như hai bên đang xung đột không ai chịu nhường ai. Muốn tách ra phải cắt từng sợi một.'),
    ("감각", "感覺", "cảm giác, giác quan",
     '"感" (감, cảm) nghĩa là cảm nhận, rung động; "覺" (각, giác) nghĩa là nhận thức, tỉnh ngộ. Hợp lại chỉ khả năng nhận thức thế giới bên ngoài qua các giác quan.',
     [
         ("이 음악은 특별한 감각을 준다.", "I eum-ak-eun teuk-byeol-han gam-gak-eul jun-da.", "Âm nhạc này mang lại một cảm giác đặc biệt."),
         ("감각이 예민한 사람은 세부적인 차이를 잘 안다.", "Gam-gak-i ye-min-han sa-ram-eun se-bu-jeo-gin cha-i-reul jal an-da.", "Người có giác quan nhạy bén dễ nhận ra sự khác biệt tinh tế."),
         ("비행기에서 귀가 멍해지는 감각이 들었다.", "Bi-haeng-gi-e-seo gwi-ga meong-hae-ji-neun gam-gak-i deul-eot-da.", "Trên máy bay tôi có cảm giác tai bị ù đi."),
         ("미술가는 색에 대한 감각이 뛰어나다.", "Mi-sul-ga-neun saek-e dae-han gam-gak-i ddwi-eo-na-da.", "Họa sĩ có cảm giác màu sắc rất xuất sắc."),
         ("감각이 둔해지는 것은 나이가 든 신호일 수 있다.", "Gam-gak-i dun-hae-ji-neun geot-eun na-i-ga deun sin-ho-il su it-da.", "Giác quan suy giảm có thể là dấu hiệu của tuổi già."),
         ("후각은 맛을 느끼는 중요한 감각이다.", "Hu-gak-eun mat-eul neu-kki-neun jung-yo-han gam-gak-i-da.", "Khứu giác là giác quan quan trọng để cảm nhận vị giác."),
     ],
     [
         ("느낌", "-", "cảm giác, cảm nhận"),
         ("인식", "認識", "nhận thức, nhận biết"),
         ("지각", "知覺", "tri giác, nhận thức"),
         ("후각", "嗅覺", "khứu giác"),
     ],
     'Hãy nghĩ đến "CẢM" (감- cảm) xúc và "GIÁC" (각- giác) ngộ. Khi bạn chạm vào nước đá, bạn có "CẢM GIÁC" lạnh — đó chính là cảm giác (감각).'),
    ("감사", "感謝", "cảm ơn, biết ơn",
     '"感" (감, cảm) là cảm nhận, rung động; "謝" (사, tạ) là tạ ơn, xin lỗi. Hợp lại chỉ sự cảm kích, biết ơn đối với người khác.',
     [
         ("도와주셔서 정말 감사합니다.", "Do-wa-ju-syeo-seo jeong-mal gam-sa-ham-ni-da.", "Thực sự cảm ơn bạn đã giúp đỡ."),
         ("감사의 마음을 전하고 싶습니다.", "Gam-sa-ui ma-eum-eul jeon-ha-go sip-seup-ni-da.", "Tôi muốn gửi gắm lòng biết ơn."),
         ("작은 것에도 감사하는 습관을 기르자.", "Ja-geun geo-se-do gam-sa-ha-neun seup-gwan-eul gi-reu-ja.", "Hãy rèn thói quen biết ơn cả những điều nhỏ nhặt."),
         ("감사하면 감사할 일이 더 많아진다.", "Gam-sa-ha-myeon gam-sa-hal il-i deo man-a-jin-da.", "Khi biết ơn, sẽ có nhiều điều để biết ơn hơn."),
         ("그분께 감사 편지를 보냈다.", "Geu-bun-kke gam-sa pyeon-ji-reul bo-naet-da.", "Tôi đã gửi thư cảm ơn đến ngài ấy."),
         ("감사 인사를 잊지 않는 것이 예의이다.", "Gam-sa in-sa-reul it-ji an-neun geot-i ye-ui-i-da.", "Không quên lời cảm ơn là phép lịch sự."),
     ],
     [
         ("고맙다", "-", "cảm ơn"),
         ("은혜", "恩惠", "ân đức, ân huệ"),
         ("보답", "報答", "báo đáp, đền đáp"),
         ("감사패", "感謝牌", "biển cảm ơn"),
     ],
     'Từ này ai cũng biết! Hãy nhớ "CẢM" (감) động trước ân tình rồi "TẠ" (사) ơn. Khi ai đó giúp bạn, hãy nói "감사합니다" — "cảm tạ ngài".'),
    ("감소", "減少", "giảm, suy giảm, thu hẹp",
     '"減" (감, giảm) nghĩa là giảm bớt, hao tổn; "少" (소, thiểu) nghĩa là ít. Hợp lại chỉ sự giảm đi về số lượng, mức độ hoặc quy mô.',
     [
         ("매출이 지난달보다 10퍼센트 감소했다.", "Mae-chul-i ji-nan-dal-bo-da sip-peo-sen-teu gam-so-haet-da.", "Doanh thu đã giảm 10% so với tháng trước."),
         ("범죄율이 현저히 감소하고 있다.", "Beom-joey-ul-i hyeon-jeo-hi gam-so-ha-go it-da.", "Tỷ lệ tội phạm đang giảm đáng kể."),
         ("인구 감소가 지역 경제에 영향을 미친다.", "In-gu gam-so-ga ji-yeok gyeong-je-e yeong-hyang-eul mi-chin-da.", "Suy giảm dân số ảnh hưởng đến kinh tế địa phương."),
         ("스트레스를 줄이면 체중도 자연스럽게 감소한다.", "Seu-teu-re-seu-reul ju-ri-myeon che-jung-do ja-yeon-seu-reop-ge gam-so-han-da.", "Giảm căng thẳng thì cân nặng cũng tự nhiên giảm."),
         ("투자 규모를 감소하기로 결정했다.", "Tu-ja gyu-mo-reul gam-so-ha-gi-ro gyeol-jeong-haet-da.", "Đã quyết định thu hẹp quy mô đầu tư."),
         ("지난해 대비 수출이 감소했다.", "Ji-nan-hae dae-bi su-chul-i gam-so-haet-da.", "Xuất khẩu đã giảm so với năm ngoái."),
     ],
     [
         ("증가", "增加", "tăng gia, gia tăng"),
         ("축소", "縮小", "suy giảm, thu nhỏ"),
         ("하락", "下落", "suy tàn, giảm xuống"),
         ("위축", "萎縮", "suy giảm, teo tóp"),
     ],
     'Hãy nghĩ đến cái cân. Khi bạn "GIẢM" (감) ăn, cân nặng trở nên "ÍT" (소) hơn — đó là giảm cân, tức 감소! Ngược lại tăng thì gọi là 증가.'),
    ("감정", "感情", "cảm xúc, tình cảm",
     '"感" (감, cảm) là cảm nhận, rung động; "情" (정, tình) là tình cảm, cảm xúc. Hợp lại chỉ những phản ứng tâm lý sâu sắc của con người.',
     [
         ("감정을 숨기는 것은 건강에 좋지 않다.", "Gam-jeong-eul sum-gi-neun geot-eun geon-gang-e jo-chi an-ta.", "Giấu cảm xúc không tốt cho sức khỏe."),
         ("그는 감정이 풍부한 사람이다.", "Geu-neun gam-jeong-i pung-bu-han sa-ram-i-da.", "Anh ấy là người có tình cảm phong phú."),
         ("이 영화는 감정을 자극한다.", "I yeong-hwa-neun gam-jeong-eul ja-geuk-han-da.", "Bộ phim này kích thích cảm xúc."),
         ("감정적으로 판단하지 말고 이성적으로 생각하라.", "Gam-jeong-jeok-euro pan-dan-ha-ji mal-go i-seong-jeok-euro saeng-gak-ha-ra.", "Đừng phán đoán theo cảm xúc mà hãy suy nghĩ một cách lý trí."),
         ("아이의 감정을 존중해 주세요.", "A-i-ui gam-jeong-eul jon-jung-hae ju-se-yo.", "Hãy tôn trọng cảm xúc của trẻ."),
         ("감정 조절 능력은 사회생활에 필수적이다.", "Gam-jeong jo-jeol neung-ryeok-eun sa-hoe-saeng-hwal-e pil-su-jeok-i-da.", "Khả năng kiểm soát cảm xúc là cần thiết trong cuộc sống xã hội."),
     ],
     [
         ("심리", "心理", "tâm lý"),
         ("기분", "氣分", "tâm trạng, khí phận"),
         ("정서", "情緖", "tình trạng, tâm tình"),
         ("정신", "精神", "tinh thần"),
     ],
     'Hãy nghĩ đến trái tim rung động "CẢM" (감) nhận được một "TÌNH" (정) cảm đặc biệt. Khi xem phim buồn, nước mắt rơi vì "cảm tình" — đó là 감정.'),
    ("감독", "監督", "giám sát, đạo diễn",
     '"監" (감, giám) nghĩa là quan sát, giám sát; "督" (독, đốc) nghĩa là đôn đốc, giám thị. Hợp lại chỉ người giám sát, đặc biệt là đạo diễn phim hoặc người quản lý.',
     [
         ("이 영화의 감독은 세계적으로 유명하다.", "I yeong-hwa-ui gam-dok-eun se-gye-jeok-euro yu-myeong-ha-da.", "Đạo diễn của bộ phim này nổi tiếng toàn cầu."),
         ("감독은 배우들에게 연기 지도를 했다.", "Gam-dok-eun bae-u-deul-e-ge yeon-gi ji-do-reul haet-da.", "Đạo diễn đã hướng dẫn diễn xuất cho các diễn viên."),
         ("건설 현장에 감독관이 배치되었다.", "Geon-seol hyeon-jang-e gam-dok-gwan-i bae-chi-doe-eot-da.", "Giám sát viên đã được bố trí tại công trường xây dựng."),
         ("그는 새 프로젝트를 감독하게 되었다.", "Geu-neun sae peu-ro-jek-teu-reul gam-dok-ha-ge doe-eot-da.", "Anh ấy đã được giao giám sát dự án mới."),
         ("감독 없이는 현장이 혼란스러워진다.", "Gam-dok eop-si-neun hyeon-jang-i hon-ran-seu-reo-wo-jin-da.", "Không có giám sát thì công trường sẽ hỗn loạn."),
         ("감독의 비전이 작품의 방향을 결정한다.", "Gam-dok-ui bi-jeon-i jak-pum-ui bang-hyang-eul gyeol-jeong-han-da.", "Tầm nhìn của đạo diễn quyết định hướng đi của tác phẩm."),
     ],
     [
         ("연출", "演出", "diễn xuất, biểu diễn"),
         ("관리", "管理", "quản lý"),
         ("지휘", "指揮", "chỉ huy, điều khiển"),
         ("제작", "制作", "chế tác, sản xuất"),
     ],
     'Hãy nghĩ đến camera "GIÁM" (감) sát và đôn "ĐỐC" (독) diễn viên. Đạo diễn đứng sau máy quay, luôn quan sát và thúc đẩy — đó chính là 감독.'),
    ("감히", "敢爲", "dám, dám làm",
     '"敢" (감, cảm) nghĩa là dám, có gan; "爲" (위, vi) nghĩa là làm, vì. Hợp lại chỉ sự can đảm làm điều gì đó, thường dùng trong câu phủ định hoặc nghi vấn.',
     [
         ("네가 감히 나에게 거짓말을 했어?", "Ne-ga gam-hi na-e-ge geo-jit-mal-eul hae-sseo?", "Mày dám nói dối ta à?"),
         ("그는 감히 상사에게 반대 의견을 냈다.", "Geu-neun gam-hi sang-sa-e-ge ban-dae ui-gyeon-eul naet-da.", "Anh ấy dám đưa ra ý kiến trái chiều với cấp trên."),
         ("누가 감히 왕의 명령을 어길 수 있겠는가?", "Nu-ga gam-hi wang-ui myeong-ryeong-eul eo-gil su i-sget-neun-ga?", "Ai dám cãi lệnh vua?"),
         ("감히 생각도 못한 일이 벌어졌다.", "Gam-hi saeng-gak-do mot-han il-i beol-eo-jyeot-da.", "Một chuyện không dám nghĩ tới đã xảy ra."),
         ("감히 제안 하나 드려도 되겠습니까?", "Gam-hi je-an ha-na deu-ryeo-do doe-get-seum-ni-kka?", "Tôi dám xin đề xuất một ý kiến được không?"),
         ("감히 내 앞에서 그런 말을 하다니!", "Gam-hi nae ap-e-seo geu-reon mal-eul ha-da-ni!", "Dám nói như vậy trước mặt ta sao!"),
     ],
     [
         ("용기", "勇氣", "dũng khí, can đảm"),
         ("대담", "大膽", "táo bạo, can đảm"),
         ("겁", "-", "sợ, nhát"),
         ("용감", "勇敢", "dũng cảm, can đảm"),
     ],
     'Hãy nghĩ đến người "CẢM" (감) dám đối mặt với nguy hiểm để "VI" (위) làm điều đúng đắn. Chỉ có kẻ thật sự can đảm mới dám (감히) đứng lên.'),
    ("강력", "强力", "mạnh mẽ, cường lực",
     '"强" (강, cường) nghĩa là mạnh, cứng rắn; "力" (력, lực) nghĩa là sức mạnh, năng lực. Hợp lại chỉ sức mạnh to lớn, quyết liệt, hùng hậu.',
     [
         ("경찰이 강력 범죄를 단속하고 있다.", "Gyeong-chal-i gang-ryeok beom-jo-eul dan-sok-ha-go it-da.", "Cảnh sát đang trấn áp tội phạm nghiêm trọng."),
         ("강력한 의지가 성공의 열쇠다.", "Gang-ryeok-han ui-ji-ga seong-gong-ui yeol-swi-da.", "Ý chí mạnh mẽ là chìa khóa của thành công."),
         ("태풍이 강력한 바람을 동반했다.", "Tae-pung-i gang-ryeok-han ba-ram-eul dong-ban-haet-da.", "Bão đi kèm với gió mạnh."),
         ("정부는 강력 조치를 취하기로 했다.", "Jeong-bu-neun gang-ryeok jo-chi-reul chwi-ha-gi-ro haet-da.", "Chính phủ đã quyết định áp dụng biện pháp mạnh."),
         ("그는 강력한 경쟁자로 부상했다.", "Geu-neun gang-ryeok-han gyeong-jaeng-ja-ro bu-sang-haet-da.", "Anh ấy đã nổi lên như một đối thủ cạnh tranh mạnh."),
         ("강력한 화재 진압을 위해 소방관이 출동했다.", "Gang-ryeok-han hwa-gae jin-ak-eul wi-hae so-bang-gwan-i chul-dong-haet-da.", "Lính cứu hỏa đã xuất động để dập tắt đám cháy lớn."),
     ],
     [
         ("힘", "力", "sức mạnh"),
         ("세력", "勢力", "thế lực, thế lực"),
         ("위력", "威力", "uy lực, oai lực"),
         ("권력", "權力", "quyền lực"),
     ],
     'Hãy nghĩ đến siêu nhân "CƯỜNG" (강) trang đầy "LỰC" (력) lượng. Khi cần thiết, anh ấy dùng sức mạnh (강력) để bảo vệ công lý.'),
    ("강요", "强要", "ép buộc, cưỡng yêu",
     '"强" (강, cường) nghĩa là mạnh, ép buộc; "要" (요, yêu) nghĩa là yêu cầu, đòi hỏi. Hợp lại chỉ việc dùng sức mạnh hoặc quyền lực để buộc người khác làm điều gì.',
     [
         ("누구에게도 강요받고 싶지 않다.", "Nu-gu-e-ge-do gang-yo-bat-go sip-ji an-ta.", "Tôi không muốn bị ai ép buộc cả."),
         ("그는 돈을 강요당했다.", "Geu-neun don-eul gang-yo-dang-haet-da.", "Anh ấy đã bị ép buộc đưa tiền."),
         ("강요 없이 자발적으로 참여하세요.", "Gang-yo eop-si ja-bal-jeok-euro cham-yeo-ha-se-yo.", "Hãy tham gia một cách tự nguyện, không ép buộc."),
         ("부모는 자녀에게 직업을 강요해서는 안 된다.", "Bu-mo-neun ja-nyeo-e-ge jik-eop-eul gang-yo-ha-seo-neun an doen-da.", "Cha mẹ không nên ép buộc con cái theo nghề nào."),
         ("그것은 강요가 아닌 권유였다.", "Geu-geot-eun gang-yo-ga a-nin gwon-yu-i-eot-da.", "Đó là khuyến khích chứ không phải ép buộc."),
         ("회사에서 초과 근무를 강요당한 적이 있다.", "Hoe-sa-e-seo cho-gwa geun-mu-reul gang-yo-dang-han jeok-i it-da.", "Tôi đã từng bị công ty ép buộc làm thêm giờ."),
     ],
     [
         ("압박", "壓迫", "áp bức, áp lực"),
         ("강제", "强制", "cưỡng chế, bắt buộc"),
         ("설득", "說得", "thuyết phục"),
         ("협박", "脅迫", "đe dọa, hăm dọa"),
     ],
     'Hãy nghĩ đến kẻ "CƯỜNG" (강) đứng trước cửa "YÊU" (요) cầu tiền bạc. Không đưa thì không cho qua — đó là ép buộc, 강요.'),
    ("강조", "强調", "nhấn mạnh",
     '"强" (강, cường) nghĩa là mạnh, gia tăng; "調" (조, điều) nghĩa là điều chỉnh, điều hòa. Hợp lại chỉ việc nhấn mạnh, làm nổi bật điều gì đó.',
     [
         ("교사는 안전의 중요성을 강조했다.", "Gyo-sa-neun an-jeon-ui jung-yo-seong-eul gang-jo-haet-da.", "Giáo viên đã nhấn mạnh tầm quan trọng của an toàn."),
         ("이 점을 특히 강조하고 싶습니다.", "I jeom-eul teuk-hi gang-jo-ha-go sip-seup-ni-da.", "Tôi muốn nhấn mạnh đặc biệt điểm này."),
         ("발음의 정확성을 강조하겠다.", "Bal-eum-ui jeong-hak-seong-eul gang-jo-ha-get-da.", "Tôi sẽ nhấn mạnh sự chính xác trong phát âm."),
         ("회의에서 팀워크를 강조했다.", "Hoe-ui-e-seo tim-wo-keu-reul gang-jo-haet-da.", "Trong cuộc họp đã nhấn mạnh tinh thần đồng đội."),
         ("그는 자신의 의견을 끊임없이 강조했다.", "Geu-neun ja-sin-ui ui-gyeon-eul ggeun-him-eop-si gang-jo-haet-da.", "Anh ấy không ngừng nhấn mạnh ý kiến của mình."),
         ("교육 현장에서 창의성 강조가 필요하다.", "Gyo-yuk hyeon-jang-e-seo chang-ui-seong gang-jo-ga pil-yo-ha-da.", "Cần nhấn mạnh tính sáng tạo trong môi trường giáo dục."),
     ],
     [
         ("부각", "浮刻", "làm nổi bật"),
         ("역설", "逆說", "giải thích ngược"),
         ("경시", "輕視", "coi nhẹ, khinh thị"),
         ("명시", "明示", "minh thị, nêu rõ"),
     ],
     'Hãy nghĩ đến micro "CƯỜNG" (강) hơn bình thường để "ĐIỀU" (조) chỉnh âm lượng. Người phát biểu nhấn mạnh (강조) điểm quan trọng bằng cách nói to hơn.'),
    ("강화", "强化", "tăng cường, cường hóa",
     '"强" (강, cường) nghĩa là mạnh, gia tăng; "化" (화, hóa) nghĩa là biến thành, hóa thành. Hợp lại chỉ việc làm cho mạnh hơn, tăng cường năng lực.',
     [
         ("근육을 강화하기 위해 매일 운동한다.", "Geun-yuk-eul gang-hwa-ha-gi wi-hae mae-il un-dong-han-da.", "Tôi tập thể dục mỗi ngày để tăng cường cơ bắp."),
         ("국방력 강화가 시급한 과제이다.", "Guk-bang-ryeok gang-hwa-ga si-geup-han gwa-je-i-da.", "Tăng cường quốc phòng là nhiệm vụ cấp bách."),
         ("두 나라는 협력을 강화하기로 합의했다.", "Du na-ra-neun hyeom-ryeok-eul gang-hwa-ha-gi-ro hab-ui-haet-da.", "Hai nước đã nhất trí tăng cường hợp tác."),
         ("면역력을 강화하려면 수면이 중요하다.", "Myeon-yeok-ryeok-eul gang-hwa-ha-ryeo-myeon su-myeon-i jung-yo-ha-da.", "Giấc ngủ quan trọng để tăng cường miễn dịch."),
         ("보안 시스템을 강화해야 한다.", "Bo-an si-seu-te-meu-reul gang-hwa-hae-ya han-da.", "Cần phải tăng cường hệ thống bảo mật."),
         ("인력을 강화하여 생산 효율을 높였다.", "In-ryeok-eul gang-hwa-ha-yeo saeng-san hyo-yul-eul no-lyeot-da.", "Đã tăng cường nhân lực để nâng cao hiệu quả sản xuất."),
     ],
     [
         ("증강", "增彊", "tăng cường"),
         ("보강", "補强", "bổ sung, củng cố"),
         ("약화", "弱化", "suy yếu, làm yếu"),
         ("강철", "强鐵", "gang thép"),
     ],
     'Hãy nghĩ đến tập gym để "CƯỜNG" (강) thân thể "HÓA" (화) thành siêu nhân. Tập luyện mỗi ngày để tăng cường (강화) sức mạnh.'),
    ("강호", "江湖", "giang hồ",
     '"江" (강, giang) nghĩa là sông lớn; "湖" (호, hồ) nghĩa là hồ nước. Hợp lại chỉ giang hồ — thế giới bên ngoài của những người du hành, võ sĩ, hoặc nghệ sĩ lưu động.',
     [
         ("그는 강호의 전설적인 인물이다.", "Geu-neun gang-ho-ui jeon-seol-jeok-in in-mul-i-da.", "Ông ấy là nhân vật huyền thoại của giang hồ."),
         ("강호에 이름을 남기고 싶었다.", "Gang-ho-e i-reum-eul nam-gi-go sip-eot-da.", "Tôi muốn để lại tên tuổi trong giang hồ."),
         ("강호를 떠도는 무희를 만났다.", "Gang-ho-reul ddeo-do-neun mu-hui-reul man-nat-da.", "Tôi đã gặp một nghệ sĩ lưu động giang hồ."),
         ("그 영화는 강호를 배경으로 한다.", "Geu yeong-hwa-neun gang-ho-reul bae-gyeong-eu-ro han-da.", "Bộ phim đó lấy bối cảnh giang hồ."),
         ("강호에서는 실력이 곧 명예다.", "Gang-ho-e-seo-neun sil-ryeok-i got myeong-ye-da.", "Trong giang hồ, thực lực chính là danh dự."),
         ("강호에 은둔하며 세상과 담을 쌓았다.", "Gang-ho-e eun-dun-ha-myeo se-sang-gwa dam-eul ssa-at-da.", "Anh ấy ẩn dật trong giang hồ và cách ly với thế gian."),
     ],
     [
         ("천하", "天下", "thiên hạ"),
         ("무림", "武林", "võ lâm"),
         ("유랑", "流浪", "lưu lãng, du hành"),
         ("은둔", "隱遁", "ẩn dật"),
     ],
     'Hãy nghĩ đến các cao thủ võ lâm bên bờ "GIANG" (강) sông và "HỒ" (호) nước. Đó là nơi họ giao đấu, hành hiệp trượng nghĩa — giang hồ (강호).'),
    ("개관", "槪觀", "khái quan, tổng quan",
     '"槪" (개, khái) nghĩa là khái lược, tóm tắt; "觀" (관, quan) nghĩa là quan sát, nhìn. Hợp lại chỉ việc nhìn nhận tổng thể, nắm bắt đại khái.',
     [
         ("이 보고서는 시장 상황에 대한 개관을 제공한다.", "I bo-go-seo-neun si-jang sang-hwang-e dae-han gae-gwan-eul je-gong-han-da.", "Báo cáo này cung cấp cái nhìn tổng quan về tình hình thị trường."),
         ("프로젝트 개관을 먼저 설명하겠습니다.", "Peu-ro-jek-teu gae-gwan-eul meon-jeo seol-myeong-ha-get-seup-ni-da.", "Tôi sẽ giải thích tổng quan dự án trước."),
         ("역사의 개관을 배우는 것이 중요하다.", "Yeok-sa-ui gae-gwan-eul bae-u-neun geot-i jung-yo-ha-da.", "Học khái quát lịch sử là điều quan trọng."),
         ("이 책은 과학의 개관서이다.", "I chaek-eun gwa-hak-ui gae-gwan-seo-i-da.", "Đây là sách khái lược về khoa học."),
         ("도시 개관 지도를 한 장 받고 싶습니다.", "Do-si gae-gwan ji-do-reul han jang bat-go sip-seup-ni-da.", "Tôi muốn nhận một bản đồ tổng quan thành phố."),
         ("문제의 개관을 파악한 후 상세히 논의하자.", "Mun-je-ui gae-gwan-eul pa-ak-han hu sang-se-hi no-ni-ha-ja.", "Hãy nắm bắt khái quan vấn đề trước rồi thảo luận chi tiết sau."),
     ],
     [
         ("개요", "槪要", "khái yếu, tóm tắt"),
         ("전반", "一般", "toàn bộ, phổ biến"),
         ("상세", "詳細", "tường tận, chi tiết"),
         ("대략", "大略", "đại lược, đại khái"),
     ],
     'Hãy đứng trên đồi cao "KHÁI" (개) lược nhìn xuống và "QUAN" (관) sát toàn cảnh. Từ trên cao bạn thấy bức tranh tổng quan (개관) của thành phố.'),
    ("개국", "開國", "khai quốc, thành lập nước",
     '"開" (개, khai) nghĩa là mở, bắt đầu; "國" (국, quốc) nghĩa là nước, quốc gia. Hợp lại chỉ việc thành lập một quốc gia mới, khởi đầu triều đại.',
     [
         ("대한민국은 1948년에 개국되었다.", "Dae-han-min-guk-eun 1948-nyeon-e gae-guk-doe-eot-da.", "Hàn Quốc được thành lập vào năm 1948."),
         ("개국 공신들의 노력이 컸다.", "Gae-guk gong-sin-deul-ui no-ryeok-i keot-da.", "Công lao của các khai quốc công thần rất lớn."),
         ("그 왕조는 개국 이래 500년을 이어갔다.", "Geu wang-jo-neun gae-guk i-rae 500-nyeon-eul i-eo-gat-da.", "Triều đại đó đã tồn tại 500 năm từ khi khai quốc."),
         ("개국 정신을 되새기는 행사가 열렸다.", "Gae-guk jeong-sin-eul doe-sae-gi-neun haeng-sa-ga yeol-ryeot-da.", "Đã tổ chức lễ tưởng niệm tinh thần khai quốc."),
         ("이 나라의 개국 신화가 전해진다.", "I na-ra-ui gae-guk sin-hwa-ga jeon-hae-jin-da.", "Thần thoại khai quốc của đất nước này được truyền tụng."),
         ("개국 기념일에는 국민들이 깃발을 흔든다.", "Gae-guk gi-nyeom-il-e-neun gung-min-deul-i git-bal-eul heun-deun-da.", "Vào ngày kỷ niệm khai quốc, người dân vẫy cờ."),
     ],
     [
         ("건국", "建國", "kiến quốc, xây dựng đất nước"),
         ("창업", "創業", "sáng nghiệp, khởi nghiệp"),
         ("멸망", "滅亡", "diệt vong, sụp đổ"),
         ("독립", "獨立", "độc lập"),
     ],
     'Hãy nghĩ đến người anh hùng "KHAI" (개) cửa biên cương để lập "QUỐC" (국) gia. Khai quốc (개국) là việc vĩ đại nhất trong lịch sử một dân tộc.'),
    ("개선", "改善", "cải thiện, cải tiến",
     '"改" (개, cải) nghĩa là thay đổi, sửa chữa; "善" (선, thiện) nghĩa là tốt đẹp, thiện lương. Hợp lại chỉ việc thay đổi theo hướng tốt hơn, cải thiện.',
     [
         ("서비스 품질을 개선해야 한다.", "Seo-bi-seu pum-jil-eul gae-seon-hae-ya han-da.", "Cần phải cải thiện chất lượng dịch vụ."),
         ("근무 환경이 많이 개선되었다.", "Geun-mu hwan-gyeong-i man-i gae-seon-doe-eot-da.", "Môi trường làm việc đã được cải thiện rất nhiều."),
         ("교통 체계 개선이 시급하다.", "Gyo-tong che-gye gae-seon-i si-geup-ha-da.", "Cải thiện hệ thống giao thông là cấp bách."),
         ("건강을 위해 생활 습관을 개선하자.", "Geon-gang-eul wi-hae saeng-hwal seup-gwan-eul gae-seon-ha-ja.", "Hãy cải thiện thói quen sống vì sức khỏe."),
         ("이번 개선안은 효과가 클 것이다.", "I-bon gae-seon-an-eun hyo-gwa-ga keul geot-i-da.", "Phương án cải tiến lần này sẽ rất hiệu quả."),
         ("학교 시설을 개선하는 데 예산이 투입되었다.", "Hak-gyo si-seul-eul gae-seon-ha-neun de ye-san-i tu-ip-doe-eot-da.", "Ngân sách đã được đầu tư để cải thiện cơ sở vật chất trường học."),
     ],
     [
         ("발전", "發展", "phát triển"),
         ("향상", "向上", "hướng thượng, nâng cao"),
         ("퇴화", "退化", "thoái hóa, suy thoái"),
         ("수리", "修理", "sửa chữa, tu bổ"),
     ],
     'Hãy nghĩ đến việc "CẢI" (개) sửa nhà cũ thành "THIỆN" (선) đẹp hơn. Thay đổi theo hướng tốt đẹp — đó chính là cải thiện (개선).'),
    ("개성", "個性", "cá tính, tính cách riêng",
     '"個" (개, cá) nghĩa là cá thể, riêng lẻ; "性" (성, tính) nghĩa là bản chất, tính chất. Hợp lại chỉ những đặc điểm riêng biệt của mỗi người, tính cách độc đáo.',
     [
         ("그녀는 개성이 뚜렷한 디자이너이다.", "Geu-nyeo-neun gae-seong-i ddu-ryeot-han di-jai-neo-i-da.", "Cô ấy là nhà thiết kế có cá tính rất rõ nét."),
         ("개성을 존중하는 사회가 되어야 한다.", "Gae-seong-eul jon-jung-ha-neun sa-hoe-ga doe-eo-ya han-da.", "Xã hội cần trở thành nơi tôn trọng cá tính."),
         ("유니폼을 입어도 개성은 숨길 수 없다.", "Yu-ni-pom-eul ib-eo-do gae-seong-eun sum-gil su eop-da.", "Mặc đồng phục cũng không thể giấu được cá tính."),
         ("그의 개성이 묻어나는 작품이다.", "Geu-ui gae-seong-i mu-deo-na-neun jak-pum-i-da.", "Đây là tác phẩm toát lên cá tính của anh ấy."),
         ("개성 있는 사람이 세상을 바꾼다.", "Gae-seong it-neun sa-ram-i se-sang-eul ba-kkun-da.", "Người có cá tính mới thay đổi được thế giới."),
         ("패션은 개성을 표현하는 하나의 수단이다.", "Pae-syeon-eun gae-seong-eul pyo-hyeon-ha-neun ha-na-ui su-dan-i-da.", "Thời trang là một cách thể hiện cá tính."),
     ],
     [
         ("특징", "特徵", "đặc trưng, đặc điểm"),
         ("성격", "性格", "tính cách"),
         ("독창", "獨創", "độc sáng, sáng tạo"),
         ("성품", "性品", "tính phẩm, phẩm chất"),
     ],
     'Hãy nghĩ đến mỗi người là một "CÁ" (개) thể riêng biệt với bản "TÍNH" (성) khác nhau. Không ai giống ai — đó chính là cá tính (개성).'),
    ("개인", "個人", "cá nhân",
     '"個" (개, cá) nghĩa là cá thể; "人" (인, nhân) nghĩa là người. Hợp lại chỉ mỗi người riêng lẻ, đối lập với tập thể hoặc tổ chức.',
     [
         ("개인의 자유는 소중한 권리이다.", "Gae-in-ui ja-yu-neun so-jung-han gwon-ri-i-da.", "Tự do cá nhân là quyền lợi quý giá."),
         ("이것은 개인적인 의견입니다.", "I-geot-eun gae-in-jeok-in ui-gyeon-im-ni-da.", "Đây là ý kiến cá nhân."),
         ("개인 정보 보호가 중요해지고 있다.", "Gae-in jeong-bo bo-ho-ga jung-yo-hae-ji-go it-da.", "Bảo vệ thông tin cá nhân ngày càng quan trọng."),
         ("개인 사정으로 회의에 참석하지 못했다.", "Gae-in sa-jeong-euro hoe-ui-e cham-seok-ha-ji mot-haet-da.", "Vì lý do cá nhân nên không thể tham dự cuộc họp."),
         ("팀보다 개인 능력이 뛰어났다.", "Tim-bo-da gae-in neung-ryeok-i ddui-eo-nat-da.", "Năng lực cá nhân xuất sắc hơn cả đội."),
         ("개인 사업자 등록을 마쳤다.", "Gae-in sa-eop-ja deung-nog-eul ma-chyeot-da.", "Tôi đã hoàn tất đăng ký hộ kinh doanh cá thể."),
     ],
     [
         ("사람", "-", "người"),
         ("단체", "團體", "đoàn thể, tập thể"),
         ("공동", "共同", "cộng đồng, chung"),
         ("사업", "事業", "sự nghiệp, kinh doanh"),
     ],
     'Hãy nghĩ đến mỗi "CÁ" (개) "NHÂN" (인) như một ngọn nến riêng biệt. Tập thể là cả chùm nến, còn cá nhân (개인) là ngọn lửa riêng của mỗi người.'),
    ("개월", "個月", "tháng",
     '"個" (개, cá) là đơn vị đếm; "月" (월, nguyệt) nghĩa là tháng, mặt trăng. Hợp lại chỉ đơn vị thời gian khoảng 30 ngày, dùng để đếm số tháng.',
     [
         ("3개월 동안 한국어를 공부했다.", "Sam-gae-wal dong-an han-guk-eo-reul gong-bu-haet-da.", "Tôi đã học tiếng Hàn trong 3 tháng."),
         ("계약 기간은 12개월이다.", "Gye-yak gi-gan-eun sip-i-gae-wal-i-da.", "Thời hạn hợp đồng là 12 tháng."),
         ("아이가 6개월이 되었다.", "A-i-ga yuk-gae-wal-i doe-eot-da.", "Bé đã được 6 tháng tuổi."),
         ("1개월에 한 번 모임을 갖는다.", "Han-gae-wal-e han beon mo-im-eul gat-neun-da.", "Chúng tôi họp một lần một tháng."),
         ("휴가는 2개월 후에 가능하다.", "Hyu-ga-neun du-gae-wal hu-e ga-neung-ha-da.", "Nghỉ phép có thể sau 2 tháng nữa."),
         ("6개월마다 건강검진을 받는다.", "Yuk-gae-wal-ma-da geon-gang-geom-jin-eul bat-neun-da.", "Tôi khám sức khỏe mỗi 6 tháng một lần."),
     ],
     [
         ("달", "-", "tháng"),
         ("년", "年", "năm"),
         ("주", "週", "tuần"),
         ("일", "日", "ngày"),
     ],
     'Hãy nghĩ đến mỗi "CÁ" (개) "NGUYỆT" (월) — mỗi lần trăng tròn là một tháng. Đếm tháng bằng cách đếm số lần trăng tròn: 1 tháng, 2 tháng (1개월, 2개월).'),
    ("객관", "客觀", "khách quan",
     '"客" (객, khách) nghĩa là khách, người ngoài; "觀" (관, quan) nghĩa là quan sát, nhìn. Hợp lại chỉ việc nhìn nhận sự việc không theo cảm xúc cá nhân, đứng từ góc độ người ngoài.',
     [
         ("객관적인 판단이 필요하다.", "Gae-gwan-jeok-in pan-dan-i pil-yo-ha-da.", "Cần có phán đoán khách quan."),
         ("감정에 휘둘리지 말고 객관적으로 봐라.", "Gam-jeong-e hwi-dul-ri-ji mal-go gae-gwan-jeok-eu-ro bwa-ra.", "Đừng để cảm xúc chi phối mà hãy nhìn một cách khách quan."),
         ("이 보고서는 객관적 자료를 담고 있다.", "I bo-go-seo-neun gae-gwan-jeok ja-ryo-reul dam-go it-da.", "Báo cáo này chứa dữ liệu khách quan."),
         ("객관적 시험 점수가 중요하다.", "Gae-gwan-jeok si-heom jeom-su-ga jung-yo-ha-da.", "Điểm thi khách quan là quan trọng."),
         ("역사를 객관적으로 기록해야 한다.", "Yeok-sa-reul gae-gwan-jeok-eu-ro gi-rok-hae-ya han-da.", "Lịch sử cần được ghi chép một cách khách quan."),
         ("객관적 증거가 없으면 고발하기 어렵다.", "Gae-gwan-jeok jeung-geo-ga eop-seu-myeon go-bal-ha-gi eo-ryeop-da.", "Khó có thể tố cáo nếu không có bằng chứng khách quan."),
     ],
     [
         ("공정", "公正", "công chính, công bằng"),
         ("주관", "主觀", "chủ quan"),
         ("중립", "中立", "trung lập"),
         ("증거", "證據", "bằng chứng, chứng cứ"),
     ],
     'Hãy nghĩ đến người "KHÁCH" (객) đứng ngoài "QUAN" (관) sát mà không thiên vị. Vì không liên quan trực tiếp nên nhìn nhận khách quan (객관) hơn.'),
    ("객석", "客席", "khách mời, ghế khách, chỗ ngồi dành cho khách",
     '"客" (객, khách) nghĩa là khách; "席" (석, tịch) nghĩa là chỗ ngồi, tịch. Hợp lại chỉ chỗ ngồi dành cho khách trong nhà hát, sân vận động hoặc buổi tiệc.',
     [
         ("객석이 만석이다.", "Gaek-seok-i man-seok-i-da.", "Ghế khách đã kín chỗ."),
         ("객석에서 박수가 터져 나왔다.", "Gae-seok-e-seo bak-su-ga teo-jyeo na-wat-da.", "Tiếng vỗ tay vang lên từ khán giả."),
         ("객석으로 초대받아 영화 시사회에 갔다.", "Gae-seok-eu-ro cho-dae-ba-da-yeo yeong-hwa si-sa-hoe-e gat-da.", "Tôi được mời làm khách mời và đi xem buổi chiếu phim sớm."),
         ("객석의 반응이 뜨거웠다.", "Gae-seok-ui ban-eung-i ddeu-geo-woss-da.", "Phản ứng của khán giả rất nhiệt liệt."),
         ("무대보다 객석이 더 긴장됐다.", "Mu-dae-bo-da gae-seok-i deo gin-jang-dwaet-da.", "Khán giả còn căng thẳng hơn cả sân khấu."),
         ("객석을 가득 메운 관객들이 환호했다.", "Gae-seok-eul ga-deuk me-un gwan-gaek-deul-i hwan-ho-haet-da.", "Khán giả lấp đầy chỗ ngồi đã hoan hô."),
     ],
     [
         ("관객", "觀客", "khán giả, quan khách"),
         ("좌석", "座席", "chỗ ngồi, ghế ngồi"),
         ("무대", "舞臺", "sân khấu"),
         ("만석", "滿席", "kín chỗ, chật kín"),
     ],
     'Hãy nghĩ đến người "KHÁCH" (객) ngồi trên "TỊCH" (석) vị trong nhà hát. Họ là khán giả, người ngồi ở ghế khách (객석) để xem biểu diễn.'),
    ("거짓", "虛僞", "giả dối, dối trá",
     '"虛" (거, hư) nghĩa là hư ảo, giả tạo; "僞" (짓, ngụy) nghĩa là ngụy trang, giả mạo. Hợp lại chỉ sự không thật, lừa dối, nói sai sự thật.',
     [
         ("거짓말은 결국 드러난다.", "Geo-jit-mal-eun gyeol-guk deu-reo-nan-da.", "Nói dối rồi cũng sẽ bị phát hiện."),
         ("그의 말에 거짓이 섞여 있다.", "Geu-ui mal-e geo-jit-i seok-kkyeo it-da.", "Trong lời nói của anh ấy có lẫn sự dối trá."),
         ("거짓 증언은 범죄이다.", "Geo-jit jeung-eon-eun beom-jo-ei-da.", "Khai man là tội phạm."),
         ("진실과 거짓을 구분하라.", "Jin-sil-gwa geo-jit-eul gu-bun-ha-ra.", "Hãy phân biệt thật và giả."),
         ("거짓으로 얻은 것은 오래가지 못한다.", "Geo-jit-eu-ro eo-deun geot-eun o-rae-ga-ji mot-han-da.", "Những gì có được bằng dối trá không tồn tại lâu."),
         ("거짓 뉴스는 사회를 혼란에 빠뜨린다.", "Geo-jit nyu-seu-neun sa-hoe-reul hon-ran-e bba-deu-rin-da.", "Tin giả làm xã hội rơi vào hỗn loạn."),
     ],
     [
         ("진실", "眞實", "chân thật, sự thật"),
         ("위조", "僞造", "ngụy tạo, giả mạo"),
         ("기만", "欺瞞", "lừa dối, gian dối"),
         ("허위", "虛僞", "hư ngụy, giả dối"),
     ],
     'Hãy nghĩ đến người nói "HƯ" (거) ảo và "NGỤY" (짓) trang sự thật. Khi bắt gặp ai đó nói dối, hãy nhớ từ 거짓 — sự giả dối.'),
]

def make_word(w):
    hangul, hanja, short_meaning, meaning, examples, related, mnemonic = w
    lines = []
    lines.append(f"## {hangul} ({hanja})")
    lines.append("")
    lines.append(f"1. GIẢI NGHĨA: Nghĩa tiếng Việt là \"{short_meaning}\". {meaning}")
    lines.append("")
    lines.append("2. 6 VÍ DỤ THỰC CHIẾN:")
    for i, (ko, boi, vi) in enumerate(examples, 1):
        lines.append(f"+ Hàn: {ko}")
        lines.append(f"+ Bồi: {boi}")
        lines.append(f"   + Việt: {vi}")
        lines.append("")
    lines.append("3. 4 TỪ LIÊN QUAN GỐC HÁN:")
    for rw, rh, rm in related:
        lines.append(f"   - {rw} ({rh}): \"{rm}\"")
    lines.append("")
    lines.append(f"4. MẸO NHỚ: {mnemonic}")
    lines.append("")
    return "\n".join(lines)

def main():
    out = ["# Phan 003 Hanja Vocabulary\n"]
    for w in WORDS:
        out.append(make_word(w))
    
    filepath = r"C:\Users\hi\Desktop\code\han\tam\Phan_003.md"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("\n".join(out))
    print(f"✅ Đã tạo: {filepath}")
    print(f"   Tổng số từ: {len(WORDS)}")

if __name__ == "__main__":
    main()
