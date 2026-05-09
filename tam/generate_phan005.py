#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Phan_005.md with 21 Hanja words (ID 184-204) — auto capitalize"""

def cap(s):
    """Capitalize first letter only, keep rest lowercase."""
    if not s:
        return s
    return s[0].upper() + s[1:]

WORDS = [
    ("계획", "計劃", "Kế hoạch, dự định",
     '"計" (계, kế) nghĩa là tính toán, kế sách; "劃" (획, hoạch) nghĩa là phân chia, vạch ra. Hợp lại chỉ việc lập ra phương án, kế hoạch để thực hiện mục tiêu.',
     [
         ("새해 계획을 세웠다.", "Sae-hae gye-hwaeg-eul se-woo-at-da.", "Đã lập kế hoạch năm mới."),
         ("이 프로젝트는 계획대로 진행 중이다.", "I peu-ro-jek-teu-neun gye-hwaek-dae-ro jin-haeng jung-i-da.", "Dự án này đang tiến hành theo kế hoạch."),
         ("계획이 틀어지지 않도록 노력하자.", "Gye-hwaek-i teul-eo-ji-ji an-do-rok no-ryeok-ha-ja.", "Hãy cố gắng để kế hoạch không bị lệch."),
         ("장기 계획을 세우는 것이 중요하다.", "Jang-gi gye-hwaek-eul se-u-neun geot-i jung-yo-ha-da.", "Lập kế hoạch dài hạn là quan trọng."),
         ("그는 계획적인 사람이다.", "Geu-neun gye-hwaek-jeok-in sa-ram-i-da.", "Anh ấy là người có tính kế hoạch."),
         ("계획을 세우기 전에 충분히 조사하라.", "Gye-hwaek-eul se-u-gi jeon-e chung-bun-hi jo-sa-ha-ra.", "Trước khi lập kế hoạch hãy điều tra kỹ lưỡng."),
     ],
     [
         ("계획서", "計劃書", "Kế hoạch thư, phương án"),
         ("안", "案", "Án, dự án"),
         ("목표", "目標", "Mục tiêu"),
         ("일정", "日程", "Nhật trình, lịch trình"),
     ],
     'Hãy nghĩ đến việc "KẾ" (계) sách tính toán rồi "HOẠCH" (획) vạch ra lộ trình. Có kế hoạch (계획) thì đi đúng hướng.'),
    ("고객", "顧客", "Khách hàng",
     '"顧" (고, cố) nghĩa là quan tâm, chăm sóc; "客" (객, khách) nghĩa là người đến thăm, khách. Hợp lại chỉ người mua hàng hoặc sử dụng dịch vụ.',
     [
         ("고객 만족이 최우선이다.", "Go-gaek man-jok-i choe-u-seon-i-da.", "Sự hài lòng của khách hàng là ưu tiên số một."),
         ("고객 센터에 전화했더니 친절했다.", "Go-gaek sen-teo-e jeon-hwa-haet-deo-ni chin-jeol-haet-da.", "Gọi trung tâm chăm sóc khách hàng thì họ rất nhiệt tình."),
         ("신규 고객을 유치하기 위해 프로모션을 한다.", "Sin-gyu go-gaek-eul yu-chi-ha-gi wi-hae peu-ro-mo-syeon-eul han-da.", "Làm khuyến mãi để thu hút khách hàng mới."),
         ("고객의 불만을 신속히 처리해야 한다.", "Go-gaek-ui bul-man-eul sin-sok-hi cheo-ri-hae-ya han-da.", "Cần xử lý khiếu nại của khách hàng nhanh chóng."),
         ("단골 고객에게 할인 혜택을 준다.", "Dan-gol go-gaek-e-ge hal-in hye-taeg-eul jun-da.", "Giảm giá cho khách hàng thân thiết."),
         ("고객 데이터를 분석하여 전략을 세운다.", "Go-gaek de-i-teo-reul bun-seok-ha-yeo jeon-ryak-eul se-un-da.", "Phân tích dữ liệu khách hàng để xây dựng chiến lược."),
     ],
     [
         ("손님", "-", "Khách"),
         ("소비자", "消費者", "Người tiêu dùng"),
         ("이용자", "利用者", "Người sử dụng"),
         ("vip", "-", "Khách hàng thân thiết"),
     ],
     'Hãy nghĩ đến người "CỐ" (고) nghĩ đến "KHÁCH" (객) hàng như thượng đế. Khách hàng (고객) luôn đúng.'),
    ("고려", "考慮", "Cân nhắc, xem xét",
     '"考" (고, khảo) nghĩa là khảo sát, nghiên cứu; "慮" (려, lự) nghĩa là suy tư, nghĩ ngợi. Hợp lại chỉ việc suy nghĩ kỹ trước khi quyết định.',
     [
         ("모든 가능성을 고려해야 한다.", "Mo-deun ga-neung-seong-eul go-ryeo-hae-ya han-da.", "Cần cân nhắc mọi khả năng."),
         ("그의 의견도 고려해 주세요.", "Geu-ui ui-gyeon-do go-ryeo-hae ju-se-yo.", "Hãy xem xét ý kiến của anh ấy nữa."),
         ("고려할 시간이 더 필요하다.", "Go-ryeo-hal si-gan-i deo pil-yo-ha-da.", "Cần thêm thời gian để cân nhắc."),
         ("비용을 고려하지 않으면 안 된다.", "Bi-yong-eul go-ryeo-ha-ji an-eu-myeon an doen-da.", "Không thể không cân nhắc đến chi phí."),
         ("그는 여러 요인을 고려한 후 결정했다.", "Geu-neun yeo-reo yo-in-eul go-ryeo-han hu gyeol-jeong-haet-da.", "Anh ấy đã cân nhắc nhiều yếu tố rồi mới quyết định."),
         ("고려 사항을 목록으로 정리하자.", "Go-ryeo sa-hang-eul mok-rok-eu-ro jeong-ri-ha-ja.", "Hãy liệt kê các vấn đề cần cân nhắc."),
     ],
     [
         ("생각", "-", "Suy nghĩ"),
         ("숙고", "熟考", "Suy xét kỹ, chín chắn"),
         ("판단", "判斷", "Phán đoán"),
         ("무시", "無視", "Phớt lờ, bỏ qua"),
     ],
     'Hãy nghĩ đến việc "KHẢO" (고) cứu kỹ lưỡng, "LỰ" (려) tư sâu sắc. Cân nhắc (고려) kỹ trước khi chọn.'),
    ("고생", "苦生", "Khổ sở, vất vả",
     '"苦" (고, khổ) nghĩa là đau khổ, cực nhọc; "生" (생, sinh) nghĩa là sống, sinh tồn. Hợp lại chỉ sự chịu đựng khó khăn, cực nhọc.',
     [
         ("고생 끝에 낙이 온다.", "Go-saeng ggeut-e na-gi on-da.", "Của để dành sau khổ sở."),
         ("그동안 고생 많으셨습니다.", "Geu-dong-an go-saeng manh-eu-syeot-seup-ni-da.", "Thời gian qua anh/chị đã vất vả nhiều."),
         ("시험 준비하느라 고생했어.", "Si-heom jun-bi-ha-neu-ra go-saeng-haet-sseo.", "Vất vả vì ôn thi đúng không."),
         ("고생하면서 돈을 모았다.", "Go-saeng-ha-myeo don-eul mo-at-da.", "Tích cóp tiền trong khổ sở."),
         ("그는 젊은 시절 고생을 많이 했다.", "Geu-neun jeol-meun si-jeol go-saeng-eul man-hi haet-da.", "Anh ấy đã trải qua nhiều khổ sở khi còn trẻ."),
         ("고생스러운 일이지만 끝까지 하겠다.", "Go-saeng-seu-reo-un il-i-ji-man ggeut-kka-ji ha-get-da.", "Dù công việc vất vả nhưng tôi sẽ làm đến cùng."),
     ],
     [
         ("수고", "受苦", "Chịu khổ, công sức"),
         ("노력", "努力", "Nỗ lực"),
         ("희생", "犧牲", "Hy sinh"),
         ("안락", "安樂", "An lạc, thoải mái"),
     ],
     'Hãy nghĩ đến cuộc "KHỔ" (고) đời đầy gian nan nhưng vẫn "SINH" (생) tồn. Khổ sở (고생) rồi sẽ qua.'),
    ("고장", "故障", "Hỏng hóc, sự cố",
     '"故" (고, cố) nghĩa là cũ, hỏng; "障" (장, chướng) nghĩa là chướng ngại, trở ngại. Hợp lại chỉ sự hư hỏng, trục trặc của máy móc hoặc hệ thống.',
     [
         ("컴퓨터가 고장 났다.", "Keom-pyu-teo-ga go-jang nat-da.", "Máy tính bị hỏng rồi."),
         ("엘리베이터 고장으로 계단을 이용했다.", "El-li-be-i-teo go-jang-eu-ro gye-dan-eul i-yong-haet-da.", "Do thang máy hỏng nên đã dùng cầu thang."),
         ("고장 수리비가 얼마나 드나요?", "Go-jang su-ri-bi-ga eol-ma-na deu-na-yo?", "Chi phí sửa chữa hỏng hóc là bao nhiêu?"),
         ("자주 고장 나는 제품은 사지 마라.", "Ja-ju go-jang na-neun je-pum-eun sa-ji ma-ra.", "Đừng mua sản phẩm hay hỏng."),
         ("고장 신고를 접수했습니다.", "Go-jang sin-go-reul jeop-su-haet-seup-ni-da.", "Đã tiếp nhận báo cáo sự cố."),
         ("차가 고장나서 길가에 섰다.", "Cha-ga go-jang-na-seo gil-ga-e seot-da.", "Xe bị hỏng nên đứng bên đường."),
     ],
     [
         ("수리", "修理", "Sửa chữa"),
         ("문제", "問題", "Vấn đề"),
         ("불량", "不良", "Bất lương, lỗi"),
         ("정상", "正常", "Chính thường, bình thường"),
     ],
     'Hãy nghĩ đến thứ "CỔ" (고) cũ kỹ bị "CHƯỚNG" (장) ngại. Hỏng hóc (고장) là lúc cần thợ sửa.'),
    ("고집", "固執", "Cố chấp, bướng bỉnh",
     '"固" (고, cố) nghĩa là chắc chắn, cứng; "執" (집, chấp) nghĩa là cầm, giữ, khăng khăng. Hợp lại chỉ tính không chịu thay đổi ý kiến dù sai.',
     [
         ("고집이 세서 말이 안 통한다.", "Go-jib-i se-seo mal-i an tong-han-da.", "Cố chấp quá nên không nghe lời."),
         ("그의 고집 때문에 일이 꼬였다.", "Geu-ui go-jib ttae-mun-e il-i kko-yeot-da.", "Vì sự cố chấp của anh ấy mà việc bị rối."),
         ("고집을 부리지 마세요.", "Go-jib-eul bu-ri-ji ma-se-yo.", "Đừng bướng bỉnh."),
         ("어린아이처럼 고집을 피우다니.", "Eo-rin-a-i-cheo-reom go-jib-eul pi-u-da-ni.", "Cố chấp như trẻ con vậy."),
         ("고집은 필요 이상으로 하지 마라.", "Go-jib-eun pil-yo i-sang-eu-ro ha-ji ma-ra.", "Đừng cố chấp quá mức cần thiết."),
         ("그녀의 고집이 때로는 존경스럽다.", "Geu-nyeo-ui go-jib-i ttae-ro-neun jon-gyeong-seu-reop-da.", "Đôi khi sự bướng bỉnh của cô ấy đáng ngưỡng mộ."),
     ],
     [
         ("완고", "頑固", "Ngoan cố"),
         ("고집스럽다", "-", "Cố chấp, cứng đầu"),
         ("융통성", "融通性", "Tính linh hoạt"),
         ("타협", "妥協", "Thỏa hiệp"),
     ],
     'Hãy nghĩ đến tảng đá "CỐ" (고) định, "CHẤP" (집) nhất không nhúc nhích. Cố chấp (고집) như đá tảng — khó lay chuyển.'),
    ("공감", "共感", "Đồng cảm",
     '"共" (공, cộng) nghĩa là cùng, chung; "感" (감, cảm) nghĩa là cảm giác, xúc động. Hợp lại chỉ việc cùng cảm nhận, chia sẻ cảm xúc với người khác.',
     [
         ("그의 이야기에 깊이 공감했다.", "Geu-ui i-ya-gi-e gip-i gong-gam-haet-da.", "Tôi đồng cảm sâu sắc với câu chuyện của anh ấy."),
         ("공감 능력이 중요한 시대이다.", "Gong-gam neung-ryeok-i jung-yo-han si-dae-i-da.", "Đây là thời đại khả năng đồng cảm quan trọng."),
         ("아픔에 대해 공감해 주셔서 감사합니다.", "A-peum-e dae-hae gong-gam-hae ju-syeo-seo gam-sa-hap-ni-da.", "Cảm ơn đã đồng cảm với nỗi đau của tôi."),
         ("공감하지 못하는 사람과는 대화가 어렵다.", "Gong-gam-ha-ji mot-ha-neun sa-ram-gwa-neun dae-hwa-ga eo-ryeop-da.", "Khó trò chuyện với người không biết đồng cảm."),
         ("그림이 공감을 불러일으켰다.", "Geu-rim-i gong-gam-eul bul-leo-il-eu-kyeot-da.", "Bức tranh đã gợi lên sự đồng cảm."),
         ("공감은 관계를 깊게 만든다.", "Gong-gam-eun gwan-gye-reul gip-ge man-deun-da.", "Đồng cảm làm sâu sắc mối quan hệ."),
     ],
     [
         ("이해", "理解", "Lý giải, hiểu"),
         ("공감대", "共感帶", "Khu vực đồng cảm"),
         ("위로", "慰勞", "An ủi"),
         ("무관심", "無關心", "Vô tâm, thờ ơ"),
     ],
     'Hãy nghĩ đến hai người "CỘNG" (공) chung một "CẢM" (감) giác. Đồng cảm (공감) là chia sẻ nỗi vui buồn.'),
    ("공개", "公開", "Công khai, mở ra",
     '"公" (공, công) nghĩa là công khai, chung; "開" (개, khai) nghĩa là mở ra, bắt đầu. Hợp lại chỉ việc đưa ra cho mọi người biết, không giấu giếm.',
     [
         ("회의 내용을 공개했다.", "Hoe-ui nae-yong-eul gong-gae-haet-da.", "Đã công khai nội dung cuộc họp."),
         ("공개 채용 공고가 떴다.", "Gong-gae chae-yong gong-go-ga tteot-da.", "Thông báo tuyển dụng công khai đã được đăng."),
         ("개인 정보는 공개하지 마세요.", "Gae-in jeong-bo-neun gong-gae-ha-ji ma-se-yo.", "Đừng công khai thông tin cá nhân."),
         ("경매가 공개로 진행된다.", "Gyeong-mae-ga gong-gae-ro jin-haeng-doen-da.", "Cuộc đấu giá được tiến hành công khai."),
         ("공개된 자료를 분석했다.", "Gong-gae-doen ja-ryo-reul bun-seok-haet-da.", "Đã phân tích tài liệu được công bố."),
         ("그의 사생활이 공개되어 곤란했다.", "Geu-ui sa-saeng-hwal-i gong-gae-doe-eo gon-ran-haet-da.", "Đời tư của anh ấy bị công khai nên rất khó xử."),
     ],
     [
         ("비공개", "非公開", "Phi công khai, riêng tư"),
         ("공표", "公表", "Công bố"),
         ("발표", "發表", "Phát biểu, công bố"),
         ("비밀", "秘密", "Bí mật"),
     ],
     'Hãy nghĩ đến cánh cửa "CÔNG" (공) chung được "KHAI" (개) mở ra. Công khai (공개) là để ai cũng nhìn thấy.'),
    ("공기", "空氣", "Không khí",
     '"空" (공, không) nghĩa là trống rỗng, bầu trời; "氣" (기, khí) nghĩa là hơi, khí. Hợp lại chỉ hỗn hợp khí bao quanh trái đất, không khí.',
     [
         ("공기가 맑아서 기분이 좋다.", "Gong-gi-ga mal-ga-seo gi-bun-i jo-ta.", "Không khí trong lành nên tâm trạng tốt."),
         ("공기청정기를 사야겠다.", "Gong-gi-cheong-jeong-gi-reul sa-ya-get-da.", "Tôi cần mua máy lọc không khí."),
         ("실내 공기가 탁하다.", "Sil-nae gong-gi-ga tak-ha-da.", "Không khí trong nhà ngột ngạt."),
         ("공기 중에 먼지가 많다.", "Gong-gi jung-e meon-ji-ga manh-da.", "Bụi trong không khí nhiều."),
         ("산에서 깨끗한 공기를 마셨다.", "San-e-seo ggae-ggeut-han gong-gi-reul ma-syeot-da.", "Đã hít thở không khí sạch trên núi."),
         ("공기 순환이 잘 안 된다.", "Gong-gi sun-hwan-i jal an doen-da.", "Lưu thông không khí không tốt."),
     ],
     [
         ("대기", "大氣", "Khí quyển"),
         ("산소", "酸素", "Oxy"),
         ("오염", "汚染", "Ô nhiễm"),
         ("청정", "淸淨", "Thanh tịnh, sạch"),
     ],
     'Hãy nghĩ đến bầu trời "KHÔNG" (공) trung đầy "KHÍ" (기) tức. Không khí (공기) là sự sống.'),
    ("공동", "共同", "Cộng đồng, chung",
     '"共" (공, cộng) nghĩa là cùng, chung; "同" (동, đồng) nghĩa là giống nhau, cùng. Hợp lại chỉ sự chia sẻ, cùng nhau làm điều gì đó.',
     [
         ("공동 목표를 달성하자.", "Gong-dong mok-pyo-reul dal-seong-ha-ja.", "Hãy đạt được mục tiêu chung."),
         ("공동 주택에 살고 있다.", "Gong-dong ju-taek-e sal-go it-da.", "Đang sống ở nhà chung cư."),
         ("공동으로 프로젝트를 진행했다.", "Gong-dong-eu-ro peu-ro-jek-teu-reul jin-haeng-haet-da.", "Đã tiến hành dự án chung."),
         ("공동 책임은 모두가 져야 한다.", "Gong-dong chaeg-im-eun mo-du-ga jyeo-ya han-da.", "Trách nhiệm chung mọi người phải gánh."),
         ("공동 구매로 돈을 절약했다.", "Gong-dong gu-mae-ro don-eul jeol-yak-haet-da.", "Tiết kiệm tiền nhờ mua chung."),
         ("공동 이익을 위해 협력하자.", "Gong-dong i-ik-eul wi-hae hyeop-ryeok-ha-ja.", "Hãy hợp tác vì lợi ích chung."),
     ],
     [
         ("협력", "協力", "Hợp lực, hợp tác"),
         ("단체", "團體", "Đoàn thể, tập thể"),
         ("혼자", "-", "Một mình"),
         ("개인", "個人", "Cá nhân"),
     ],
     'Hãy nghĩ đến mọi người "CỘNG" (공) nhau "ĐỒNG" (동) lòng. Cộng đồng (공동) là sức mạnh tập thể.'),
    ("공부", "工夫", "Học tập, học",
     '"工" (공, công) nghĩa là công việc, lao động; "夫" (부, phu) nghĩa là người đàn ông, công phu. Hợp lại chỉ việc dành thời gian nghiên cứu, học hỏi kiến thức.',
     [
         ("매일 꾸준히 공부해야 한다.", "Mae-il kku-jun-hi gong-bu-hae-ya han-da.", "Phải học tập đều đặn mỗi ngày."),
         ("영어 공부가 재미있다.", "Yeong-eo gong-bu-ga jae-mi-it-da.", "Học tiếng Anh thú vị."),
         ("시험 전날 밤새 공부했다.", "Si-heom jeon-nal bam-sae gong-bu-haet-da.", "Thức đêm học trước ngày thi."),
         ("공부 방법을 바꿔야겠다.", "Gong-bu bang-beob-eul ba-kkwo-ya-get-da.", "Tôi cần thay đổi phương pháp học."),
         ("그는 공부를 위해 도서관에 간다.", "Geu-neun gong-bu-reul wi-hae do-seo-gwan-e gan-da.", "Anh ấy đến thư viện để học."),
         ("공부만 하는 것은 건강에 해롭다.", "Gong-bu-man ha-neun geot-eun geon-gang-e hae-rop-da.", "Chỉ học không thì có hại cho sức khỏe."),
     ],
     [
         ("학습", "學習", "Học tập"),
         ("학문", "學問", "Học vấn"),
         ("성적", "成績", "Thành tích, điểm số"),
         ("노력", "努力", "Nỗ lực"),
     ],
     'Hãy nghĩ đến người "CÔNG" (공) nhân "PHU" (부) chịu khó đèn sách. Học tập (공부) là công phu của trí tuệ.'),
    ("공사", "工事", "Công trình, xây dựng",
     '"工" (공, công) nghĩa là công việc, lao động; "事" (사, sự) nghĩa là việc, sự việc. Hợp lại chỉ công việc xây dựng, tu sửa công trình.',
     [
         ("길 공사 때문에 교통이 혼잡하다.", "Gil gong-sa ttae-mun-e gyo-tong-i hon-jap-ha-da.", "Giao thông hỗn loạn vì công trình đường."),
         ("아파트 공사가 한창이다.", "A-pa-teu gong-sa-ga han-chang-i-da.", "Công trình chung cư đang rầm rộ."),
         ("공사 현장에 출입 금지입니다.", "Gong-sa hyeon-jang-e chul-ip geum-ji-im-ni-da.", "Cấm vào khu vực thi công."),
         ("공사 기간이 연장되었다.", "Gong-sa gi-gan-i yeon-jang-doe-eot-da.", "Thời gian thi công đã bị kéo dài."),
         ("공사 비용이 예상보다 많이 들었다.", "Gong-sa bi-yong-i ye-sang-bo-da man-hi deul-eot-da.", "Chi phí xây dựng cao hơn dự kiến."),
         ("공사를 마무리하는 단계이다.", "Gong-sa-reul ma-mu-ri-ha-neun dan-gye-i-da.", "Đang ở giai đoạn hoàn thiện công trình."),
     ],
     [
         ("건설", "建設", "Kiến thiết, xây dựng"),
         ("수리", "修理", "Sửa chữa"),
         ("현장", "現場", "Hiện trường"),
         ("완공", "完工", "Hoàn công"),
     ],
     'Hãy nghĩ đến nơi "CÔNG" (공) nhân làm việc trong "TRƯỜNG" (장) lớn. Nhà máy (공장) là nơi ra đời sản phẩm.'),
    ("공식", "公式", "Công thức, chính thức",
     '"公" (공, công) nghĩa là công khai, chung; "式" (식, thức) nghĩa là cách thức, quy tắc. Hợp lại chỉ quy tắc, phương pháp chuẩn mực được công nhận.',
     [
         ("수학 공식을 외웠다.", "Su-hak gong-sik-eul oe-woot-da.", "Đã thuộc công thức toán học."),
         ("공식적으로 발표되었다.", "Gong-sik-jeok-eu-ro bal-pyo-doe-eot-da.", "Đã được công bố chính thức."),
         ("이 공식은 모든 경우에 적용된다.", "I gong-sik-eun mo-deun gyeong-u-e jeok-doeong-doen-da.", "Công thức này áp dụng cho mọi trường hợp."),
         ("공식 절차를 따라야 한다.", "Gong-sik jeol-cha-reul dda-ra-ya han-da.", "Phải tuân theo thủ tục chính thức."),
         ("공식 계정으로 문의하세요.", "Gong-sik gye-jeong-eu-ro mun-ui-ha-se-yo.", "Vui lòng liên hệ qua tài khoản chính thức."),
         ("그들은 공식적으로 이혼했다.", "Geu-deul-eun gong-sik-jeok-eu-ro i-hon-haet-da.", "Họ đã ly hôn chính thức."),
     ],
     [
         ("비공식", "非公式", "Phi chính thức"),
         ("방법", "方法", "Phương pháp"),
         ("원리", "原理", "Nguyên lý"),
         ("정식", "正式", "Chính thức"),
     ],
     'Hãy nghĩ đến "CÔNG" (공) khai quy tắc "THỨC" (식) mực. Công thức (공식) là chìa khóa giải toán.'),
    ("공연", "公演", "Biểu diễn, trình diễn",
     '"公" (공, công) nghĩa là công khai, chung; "演" (연, diễn) nghĩa là diễn xuất, biểu diễn. Hợp lại chỉ việc trình diễn nghệ thuật trước công chúng.',
     [
         ("공연 티켓을 예매했다.", "Gong-yeon ti-ket-eul ye-mae-haet-da.", "Đã đặt vé biểu diễn."),
         ("무대 공연이 멋졌다.", "Mu-dae gong-yeon-i meot-jyeot-da.", "Buổi biểu diễn sân khấu tuyệt vời."),
         ("공연 날짜가 변경되었다.", "Gong-yeon nal-jja-ga byeon-gyeong-doe-eot-da.", "Ngày biểu diễn đã thay đổi."),
         ("학교에서 연극 공연을 했다.", "Hak-gyo-e-seo yeon-geuk gong-yeon-eul haet-da.", "Trường đã tổ chức biểu diễn kịch."),
         ("공연장이 만석이었다.", "Gong-yeon-jang-i man-seok-i-eot-da.", "Nhà hát chật kín người."),
         ("그는 공연을 위해 매일 연습한다.", "Geu-neun gong-yeon-eul wi-hae mae-il yeon-seup-han-da.", "Anh ấy tập luyện mỗi ngày cho buổi biểu diễn."),
     ],
     [
         ("무대", "舞臺", "Sân khấu"),
         ("연극", "演劇", "Kịch, tuồng"),
         ("콘서트", "-", "Buổi hòa nhạc"),
         ("관객", "觀客", "Khán giả"),
     ],
     'Hãy nghĩ đến sân khấu "CÔNG" (공) khai "DIỄN" (연) xuất. Biểu diễn (공연) là ánh đèn rọi xuống nghệ sĩ.'),
    ("공원", "公園", "Công viên",
     '"公" (공, công) nghĩa là công chúng, chung; "園" (원, viên) nghĩa là vườn, khuôn viên. Hợp lại chỉ khu vực cây xanh mở cửa cho công chúng thư giãn.',
     [
         ("주말에 공원에 산책하러 간다.", "Ju-mal-e gong-won-e san-chaek-ha-reo gan-da.", "Cuối tuần đi dạo công viên."),
         ("공원에서 아이들이 놀고 있다.", "Gong-won-e-seo a-i-deul-i nol-go it-da.", "Trẻ con đang chơi ở công viên."),
         ("도심 속 공원은 소중한 휴식 공간이다.", "Do-sim sok gong-won-eun so-jung-han hyu-sik gong-gan-i-da.", "Công viên giữa trung tâm thành phố là không gian nghỉ ngơi quý giá."),
         ("공원 벤치에 앉아 책을 읽었다.", "Gong-won ben-chi-e an-ja chaeg-eul il-geo-at-da.", "Ngồi đọc sách trên ghế công viên."),
         ("공원에 벚꽃이 만개했다.", "Gong-won-e beot-kkoch-i man-gae-haet-da.", "Hoa anh đào nở rộ trong công viên."),
         ("공원을 청소하는 봉사활동을 했다.", "Gong-won-eul cheong-so-ha-neun bong-sa-hwal-dong-eul haet-da.", "Tham gia hoạt động tình nguyện dọn công viên."),
     ],
     [
         ("정원", "庭園", "Vườn, khuôn viên"),
         ("산책", "散策", "Dạo, tản bộ"),
         ("휴식", "休息", "Nghỉ ngơi"),
         ("자연", "自然", "Tự nhiên"),
     ],
     'Hãy nghĩ đến khu "CÔNG" (공) cộng "VIÊN" (원) tử xanh mát. Công viên (공원) là lá phổi của thành phố.'),
    ("공장", "工場", "Nhà máy, xí nghiệp",
     '"工" (공, công) nghĩa là công việc, lao động; "場" (장, trường) nghĩa là nơi chốn, sân. Hợp lại chỉ nơi sản xuất hàng hóa, chế tạo sản phẩm.',
     [
         ("공장에서 자동차를 생산한다.", "Gong-jang-e-seo ja-dong-cha-reul saeng-san-han-da.", "Nhà máy sản xuất ô tô."),
         ("공장 근무 시간이 길다.", "Gong-jang geun-mu si-gan-i gil-da.", "Thời gian làm việc ở nhà máy dài."),
         ("그는 공장에 취직했다.", "Geu-neun gong-jang-e chwi-jik-haet-da.", "Anh ấy đã xin được việc ở nhà máy."),
         ("공장 배출가스로 공기가 나빠졌다.", "Gong-jang bae-chul ga-seu-ro gong-gi-ga na-bba-jyeot-da.", "Khí thải nhà máy làm không khí xấu đi."),
         ("공장을 자동화하는 중이다.", "Gong-jang-eul ja-dong-hwa-ha-neun jung-i-da.", "Đang tự động hóa nhà máy."),
         ("공장 근로자들의 안전이 중요하다.", "Gong-jang geun-ro-ja-deul-ui an-jeon-i jung-yo-ha-da.", "An toàn của công nhân nhà máy là quan trọng."),
     ],
     [
         ("제조", "製造", "Chế tạo, sản xuất"),
         ("생산", "生產", "Sản xuất"),
         ("업체", "業體", "Doanh nghiệp"),
         ("노동자", "勞動者", "Người lao động"),
     ],
     'Hãy nghĩ đến nơi "CÔNG" (공) nhân làm việc trong "TRƯỜNG" (장) lớn. Nhà máy (공장) là nơi ra đời sản phẩm.'),
    ("공주", "公主", "Công chúa",
     '"公" (공, công) nghĩa là công tước; "主" (주, chủ) nghĩa là chủ nhân, người đứng đầu. Hợp lại chỉ con gái của vua hoặc hoàng tử, người có địa vị cao quý.',
     [
         ("동화 속 공주는 아름다웠다.", "Dong-hwa sok gong-ju-neun a-reum-da-woot-da.", "Công chúa trong truyện cổ tích rất đẹp."),
         ("공주님 같은 분위기를 풍긴다.", "Gong-ju-nim gat-eun bun-wi-gi-reul pung-gin-da.", "Toát lên khí chất như công chúa."),
         ("영국의 공주가 방문했다.", "Yeong-guk-ui gong-ju-ga bang-mun-haet-da.", "Công chúa nước Anh đã đến thăm."),
         ("우리 집 고양이는 공주처럼 군다.", "U-ri jib go-yang-i-neun gong-ju-cheo-reom gun-da.", "Con mèo nhà tôi ăn diện như công chúa."),
         ("공주와 왕자의 이야기를 들려주었다.", "Gong-ju-wa wang-ja-ui i-ya-gi-reul deul-lyeo-ju-eot-da.", "Kể chuyện công chúa và hoàng tử."),
         ("그녀는 마치 동화 속 공주 같았다.", "Geu-nyeo-neun ma-chi dong-hwa sok gong-ju gat-at-da.", "Cô ấy như công chúa bước ra từ truyện cổ tích."),
     ],
     [
         ("왕자", "王子", "Hoàng tử"),
         ("귀족", "貴族", "Quý tộc"),
         ("왕비", "王妃", "Vương phi, hoàng hậu"),
         ("황실", "皇室", "Hoàng thất"),
     ],
     'Hãy nghĩ đến tiểu thư "CÔNG" (공) tước là "CHỦ" (주) nhân lâu đài. Công chúa (공주) là ngôi sao trong truyện cổ tích.'),
    ("공지", "公知", "Thông báo, công bố",
     '"公" (공, công) nghĩa là công khai; "知" (지, tri) nghĩa là biết, hiểu. Hợp lại chỉ việc đưa thông tin cho mọi người cùng biết.',
     [
         ("공지사항을 꼭 읽어주세요.", "Gong-ji-sa-hang-eul kkok il-geo-ju-se-yo.", "Hãy nhất định đọc thông báo."),
         ("공지가 올라왔으니 확인하세요.", "Gong-ji-ga ol-la-wat-eu-ni hwak-in-ha-se-yo.", "Thông báo đã đăng, hãy kiểm tra."),
         ("중요 공지는 이메일로도 발송된다.", "Jung-yo gong-ji-neun i-me-il-ro-do bal-song-doen-da.", "Thông báo quan trọng cũng gửi qua email."),
         ("공지 내용을 위반하면 제재를 받는다.", "Gong-ji nae-yong-eul wi-ban-ha-myeon je-jae-reul bat-neun-da.", "Vi phạm nội dung thông báo sẽ bị xử lý."),
         ("공지 없이 일정이 변경되었다.", "Gong-ji eop-si il-jeong-i byeon-gyeong-doe-eot-da.", "Lịch trình thay đổi mà không có thông báo."),
         ("게시판에 공지를 올렸다.", "Ge-si-ban-e gong-ji-reul ol-ryeot-da.", "Đã đăng thông báo lên bảng tin."),
     ],
     [
         ("공고", "公告", "Công cáo, thông báo"),
         ("알림", "-", "Thông báo"),
         ("통보", "通報", "Thông báo, thông tri"),
         ("안내", "案內", "Hướng dẫn"),
     ],
     'Hãy nghĩ đến việc "CÔNG" (공) khai cho mọi người cùng "TRI" (지) biết. Thông báo (공지) là để không ai bỏ lỡ.'),
    ("공짜", "-", "Miễn phí, không tốn tiền",
     'Từ thuần Hàn, không có Hán tự tương ứng. "공" (gong) nghĩa là công chúng, chung; "짜" (jja) nghĩa là hào, tiền đồng xu cũ. Hợp lại chỉ điều được cho không, không mất phí.',
     [
         ("공짜로 받은 것을 팔았다.", "Gong-jja-ro bat-eun geot-eul pal-at-da.", "Đã bán thứ được cho miễn phí."),
         ("세상에 공짜는 없다.", "Se-sang-e gong-jja-neun eop-da.", "Trên đời không có gì miễn phí."),
         ("공짜 샘플을 나눠줬다.", "Gong-jja saem-peul-eul na-nwo-jwot-da.", "Phát mẫu thử miễn phí."),
         ("공짜로 입장할 수 있는 날이다.", "Gong-jja-ro ip-jang-hal su in-neun nal-i-da.", "Hôm nay vào cửa miễn phí."),
         ("공짜밥은 없다는 말이 있다.", "Gong-jja-bap-eun eop-da-neun mal-i it-da.", "Có câu không có cơm miễn phí."),
         ("그는 공짜로 여행하게 되었다.", "Geu-neun gong-jja-ro yeo-haeng-ha-ge doe-eot-da.", "Anh ấy được đi du lịch miễn phí."),
     ],
     [
         ("무료", "無料", "Miễn phí"),
         ("할인", "割引", "Giảm giá"),
         ("유료", "有料", "Có phí, trả tiền"),
         ("선물", "前物", "Quà tặng"),
     ],
     'Hãy nghĩ đến "CÔNG" (공) chung chẳng mất đồng "GIÁ" (짜) nào. Miễn phí (공짜) là món quà của cuộc đời.'),
    ("공통", "共通", "Chung, phổ biến",
     '"共" (공, cộng) nghĩa là cùng, chung; "通" (통, thông) nghĩa là thông suốt, chung. Hợp lại chỉ điều mà nhiều người hoặc nhóm cùng có, cùng chia sẻ.',
     [
         ("우리의 공통 관심사는 음악이다.", "U-ri-ui gong-tong gwan-sim-sa-neun eum-ak-i-da.", "Sở thích chung của chúng tôi là âm nhạc."),
         ("공통점을 찾아보면 친해지기 쉽다.", "Gong-tong-jeom-eul cha-ja-bo-myeon chin-hae-ji-gi swip-da.", "Tìm điểm chung thì dễ làm bạn."),
         ("두 나라 간 공통 언어가 없다.", "Du na-ra gan gong-tong eo-neo-ga eop-da.", "Hai nước không có ngôn ngữ chung."),
         ("공통 목표를 위해 힘을 모았다.", "Gong-tong mok-pyo-reul wi-hae him-eul mo-at-da.", "Tập hợp sức lực vì mục tiêu chung."),
         ("공통의 적이 있으면 연합한다.", "Gong-tong-ui jeok-i i-seu-myeon yeon-hap-han-da.", "Có kẻ thù chung thì liên minh."),
         ("이 문제는 우리 모두의 공통 과제이다.", "I mun-je-neun u-ri mo-du-ui gong-tong gwa-je-i-da.", "Vấn đề này là bài tập chung của tất cả."),
     ],
     [
         ("공유", "共有", "Cộng hữu, chia sẻ"),
         ("일반", "一般", "Nhất ban, phổ biến"),
         ("차이", "差異", "Khác biệt"),
         ("특색", "特色", "Đặc sắc, đặc trưng"),
     ],
     'Hãy nghĩ đến điều "CỘNG" (공) chung "THÔNG" (통) suốt giữa mọi người. Chung (공통) là sợi dây kết nối.'),
    ("공포", "恐怖", "Khủng bố, sợ hãi",
     '"恐" (공, khủng) nghĩa là sợ, kinh hoàng; "怖" (포, bố) nghĩa là sợ hãi, khiếp sợ. Hợp lại chỉ cảm giác sợ hãi tột độ, kinh hoàng.',
     [
         ("공포 영화를 보면 잠이 안 온다.", "Gong-po yeong-hwa-reul bo-myeon jam-i an on-da.", "Xem phim kinh dị thì không ngủ được."),
         ("그는 공포에 질려 움직이지 못했다.", "Geu-neun gong-po-e jil-lyeo um-jik-i-ji mot-haet-da.", "Anh ấy sợ đến mức không thể cử động."),
         ("공포 분위기가 연출되었다.", "Gong-po bun-wi-gi-ga yeon-chul-doe-eot-da.", "Không khí kinh hoàng đã được tạo ra."),
         ("높이에 대한 공포증이 있다.", "No-pi-e dae-han gong-po-jung-i it-da.", "Tôi có chứng sợ độ cao."),
         ("공포를 이겨내는 것이 성장이다.", "Gong-po-reul i-gyeo-nae-neun geot-i seong-jang-i-da.", "Vượt qua nỗi sợ là trưởng thành."),
         ("그의 눈에 공포가 가득 찼다.", "Geu-ui nun-e gong-po-ga ga-deuk chat-da.", "Đôi mắt anh ấy đầy vẻ sợ hãi."),
     ],
     [
         ("두려움", "-", "Nỗi sợ"),
         ("공포증", "恐怖症", "Chứng sợ"),
         ("공포심", "恐怖心", "Tâm lý sợ hãi"),
         ("용기", "勇氣", "Dũng khí"),
     ],
     'Hãy nghĩ đến bóng tối làm lòng "KHỦNG" (공) loạn, "BỐ" (포) rối. Khủng bố (공포) là khi sợ chiếm lấy tâm trí.'),
    ("공허", "空虛", "Trống rỗng, hư vô",
     '"空" (공, không) nghĩa là trống rỗng; "虛" (허, hư) nghĩa là hư ảo, không thực. Hợp lại chỉ cảm giác thiếu vắng, không có ý nghĩa.',
     [
         ("공허한 느낌이 들었다.", "Gong-heo-han neu-ggim-i deul-eot-da.", "Cảm thấy trống rỗng."),
         ("성공 후에도 공허함을 느꼈다.", "Seong-gong hu-e-do gong-heo-ham-eul neu-ggyeot-da.", "Dù thành công vẫn cảm thấy trống trải."),
         ("그의 미소에는 공허함이 배어 있었다.", "Geu-ui mi-so-e-neun gong-heo-ham-i bae-eo i-seot-da.", "Nụ cười anh ấy thoáng vẻ trống rỗng."),
         ("밤하늘의 공허함이 느껴졌다.", "Bam-ha-neul-ui gong-heo-ham-i neu-ggyeo-jyeot-da.", "Cảm nhận được sự hư vô của bầu trời đêm."),
         ("공허한 방안에 메아리만 울렸다.", "Gong-heo-han bang-an-e me-a-ri-man ul-lyeot-da.", "Tiếng vang vọng trong căn phòng trống."),
         ("그녀의 눈빛은 공허했다.", "Geu-nyeo-ui nun-bit-eun gong-heo-haet-da.", "Ánh mắt cô ấy trống rỗng."),
     ],
     [
         ("허무", "虛無", "Hư vô"),
         ("공백", "空白", "Khoảng trắng, bỏ trống"),
         ("실망", "失望", "Thất vọng"),
         ("충만", "充滿", "Tràn đầy, đầy đủ"),
     ],
     'Hãy nghĩ đến căn phòng "KHÔNG" (공) trống, "HƯ" (허) ảo không người. Trống rỗng (공허) là khi lòng không có điểm tựa.'),
    ("공휴일", "公休日", "Ngày nghỉ lễ, ngày nghỉ chung",
     '"公" (공, công) nghĩa là công chúng, chung; "休" (휴, hưu) nghĩa là nghỉ ngơi; "日" (일, nhật) nghĩa là ngày. Hợp lại chỉ ngày nghỉ chung của toàn xã hội, thường là ngày lễ.',
     [
         ("다음 주 공휴일이 무엇인가요?", "Da-eum ju gong-hyu-il-i mu-eo-sin-ga-yo?", "Ngày nghỉ lễ tuần sau là ngày gì?"),
         ("공휴일에는 은행이 문을 닫는다.", "Gong-hyu-il-e-neun eun-haeng-i mun-eul dan-neun-da.", "Ngày lễ ngân hàng đóng cửa."),
         ("공휴일을 맞아 가족들과 여행 갔다.", "Gong-hyu-il-eul ma-ja ga-jok-deul-gwa yeo-haeng gat-da.", "Nhân dịp nghỉ lễ đã đi du lịch với gia đình."),
         ("공휴일에도 일하는 사람들이 있다.", "Gong-hyu-il-e-do il-ha-neun sa-ram-deul-i it-da.", "Có người vẫn làm việc ngày lễ."),
         ("이번 달 공휴일이 많다.", "I-beon dal gong-hyu-il-i manh-da.", "Tháng này nhiều ngày nghỉ lễ."),
         ("공휴일에는 교통이 복잡하다.", "Gong-hyu-il-e-neun gyo-tong-i bok-jap-ha-da.", "Ngày lễ giao thông phức tạp."),
     ],
     [
         ("휴일", "休日", "Ngày nghỉ"),
         ("연휴", "連休", "Nghỉ liền, nghỉ dài"),
         ("근무", "勤務", "Làm việc, công tác"),
         ("명절", "名節", "Danh tiết, lễ tết"),
     ],
     'Hãy nghĩ đến ngày "CÔNG" (공) chung được "HƯU" (휴) nghỉ "NHẬT" (일). Ngày nghỉ lễ (공휴일) là món quà của thời gian.'),
    ("과거", "過去", "Quá khứ",
     '"過" (과, quá) nghĩa là qua, vượt qua; "去" (거, khứ) nghĩa là đi, rời. Hợp lại chỉ thời gian đã trôi qua, không quay lại được.',
     [
         ("과거를 후회해도 소용없다.", "Gwa-geo-reul hu-hoe-hae-do so-yong-eop-da.", "Hối hận quá khứ cũng vô ích."),
         ("과거의 실패를教訓 삼아라.", "Gwa-geo-ui sil-pae-reul gyo-hun sam-a-ra.", "Lấy thất bại quá khứ làm bài học."),
         ("과거와 화해하는 것이 중요하다.", "Gwa-geo-wa hwa-hae-ha-neun geot-i jung-yo-ha-da.", "Hòa giải với quá khứ là quan trọng."),
         ("그는 과거에 살고 있다.", "Geu-neun gwa-geo-e sal-go it-da.", "Anh ấy đang sống trong quá khứ."),
         ("과거 사진을 보며 추억에 잠겼다.", "Gwa-geo sa-jin-eul bo-myeo chu-eok-e jam-gyeot-da.", "Ngắm ảnh cũ mà chìm trong hoài niệm."),
         ("과거를 잊고 새 출발을 하자.", "Gwa-geo-reul it-go sae chul-bal-eul ha-ja.", "Hãy quên quá khứ và bắt đầu lại."),
     ],
     [
         ("현재", "現在", "Hiện tại"),
         ("미래", "未來", "Tương lai"),
         ("추억", "追憶", "Hoài niệm, hồi tưởng"),
         ("역사", "歷史", "Lịch sử"),
     ],
     'Hãy nghĩ đến thời gian đã "QUÁ" (과) đi "KHỨ" (거) mãi. Quá khứ (과거) là chương đã đóng lại.'),
    ("과연", "果然", "Quả nhiên, liệu có",
     '"果" (과, quả) nghĩa là kết quả, thật sự; "然" (연, nhiên) nghĩa là như vậy, đúng thế. Hợp lại dùng để nhấn mạnh sự thật hoặc nghi vấn về điều gì đó.',
     [
         ("과연 그 말이 사실일까?", "Gwa-yeon geu mal-i sa-sil-il-kka?", "Liệu lời đó có phải sự thật?"),
         ("과연 대단한 실력이었다.", "Gwa-yeon dae-dan-han sil-ryeok-i-eot-da.", "Quả nhiên là thực lực phi thường."),
         ("과연 그가 해낼 수 있을까?", "Gwa-yeon geu-ga hae-nal su i-sseul-kka?", "Liệu anh ấy có làm được không?"),
         ("과연 기대만큼 좋았다.", "Gwa-yeon gi-dae-man-keum jo-at-da.", "Quả nhiên tốt như mong đợi."),
         ("과연 그럴 리가 없지.", "Gwa-yeon geu-reol ri-ga eop-ji.", "Quả nhiên không thể như vậy."),
         ("과연 명불허전이었다.", "Gwa-yeon myeong-bul-heo-jeon-i-eot-da.", "Quả nhiên danh bất hư truyền."),
     ],
     [
         ("정말", "-", "Thật sự"),
         ("역시", "-", "Quả nhiên, như dự đoán"),
         ("설마", "-", "Lẽ nào, chẳng lẽ"),
         ("확실히", "確實", "Chắc chắn"),
     ],
     'Hãy nghĩ đến "QUẢ" (과) nhiên đúng "NHIÊN" (연) như vậy. Khi kết quả đúng như dự đoán — đó là quả nhiên (과연).'),
]

def make_word(w):
    hangul, hanja, short_meaning, meaning, examples, related, mnemonic = w
    short_meaning = cap(short_meaning)
    examples = [(ko, boi, cap(vi)) for ko, boi, vi in examples]
    related = [(rw, rh, cap(rm)) for rw, rh, rm in related]
    
    lines = []
    lines.append(f"## {hangul} ({hanja})")
    lines.append("")
    lines.append(f"1. GIẢI NGHĨA: Nghĩa tiếng Việt là \"{short_meaning}\". {meaning}")
    lines.append("")
    lines.append("2. 6 VÍ DỤ THỰC CHIẾN:")
    for ko, boi, vi in examples:
        lines.append(f"+ Hàn: {ko}")
        lines.append(f"+ Bồi: {boi}")
        lines.append(f"   + Việt: {vi}")
        lines.append("")
    lines.append("3. 4 TỪ LIÊN QUAN GỐC HÁN:")
    for rw, rh, rm in related:
        lines.append(f"   - {rw} ({rh}): {rm}")
    lines.append("")
    lines.append(f"4. MẸO NHỚ: {mnemonic}")
    lines.append("")
    return "\n".join(lines)

def main():
    out = ["# Phan 005 Hanja Vocabulary\n"]
    for w in WORDS:
        out.append(make_word(w))
    
    filepath = r"C:\Users\hi\Desktop\code\han\tam\Phan_005.md"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("\n".join(out))
    
    print(f"✅ Đã tạo: {filepath}")
    print(f"   Tổng số từ: {len(WORDS)}")
    print(f"   ID trên DB: 184 – {184 + len(WORDS) - 1}")
    print(f"   Số thứ tự web: #85 – #{184 + len(WORDS) - 100}")

if __name__ == "__main__":
    main()
