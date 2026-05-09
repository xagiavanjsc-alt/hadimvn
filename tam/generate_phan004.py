#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Phan_004.md with 21 Hanja words (ID 163-183)"""

WORDS = [
    ("거절", "拒絶", "từ chối, khước từ",
     '"拒" (거, cự) nghĩa là từ chối, kháng cự; "絶" (절, tuyệt) nghĩa là đứt, ngừng. Hợp lại chỉ việc không chấp nhận đề nghị, yêu cầu của người khác.',
     [
         ("그의 프로포즈를 거절했다.", "Geu-ui peu-ro-po-jeu-reul geo-jeol-haet-da.", "Cô ấy đã từ chối lời cầu hôn của anh ấy."),
         ("제안을 거절할 이유가 없었다.", "Je-an-eul geo-jeol-hal i-yu-ga eop-eot-da.", "Không có lý do để từ chối đề xuất."),
         ("면접에서 거절당하면 기분이 상한다.", "Myeon-jeob-e-seo geo-jeol-dang-ha-myeon gi-bun-i sang-han-da.", "Bị từ chối trong phỏng vấn thì tâm trạng tệ."),
         ("정중하게 거절하는 법을 배워야 한다.", "Jeong-jung-ha-ge geo-jeol-ha-neun beob-eul bae-wo-ya han-da.", "Cần học cách từ chối một cách lịch sự."),
         ("그는 초대를 거절하고 집에 남았다.", "Geu-neun cho-dae-reul geo-jeol-ha-go jip-e nam-at-da.", "Anh ấy từ chối lời mời và ở nhà."),
         ("은행에서 대출 신청이 거절되었다.", "Eun-haeng-e-seo dae-chul sin-cheong-i geo-jeol-doe-eot-da.", "Đơn xin vay vốn đã bị ngân hàng từ chối."),
     ],
     [
         ("수락", "受諾", "thụ nạp, chấp nhận"),
         ("거부", "拒否", "cự tuyệt, khước từ"),
         ("거절감", "拒絶感", "cảm giác bị từ chối"),
         ("거부권", "拒否權", "quyền phủ quyết"),
     ],
     'Hãy nghĩ đến người "CỰ" (거) lại mọi lời mời một cách "TUYỆT" (절) đối. Không ai lay chuyển được quyết định từ chối (거절) của anh ấy.'),
    ("거리", "距離", "khoảng cách",
     '"距" (거, cự) nghĩa là xa, cách; "離" (리, li) nghĩa là xa, rời. Hợp lại chỉ khoảng không gian giữa hai điểm, hai người.',
     [
         ("집에서 학교까지 거리가 멀다.", "Jib-e-seo hak-gyo-kka-ji geo-ri-ga meol-da.", "Khoảng cách từ nhà đến trường xa."),
         ("두 사람 사이의 거리가 멀어졌다.", "Du sa-ram sa-i-ui geo-ri-ga meol-eo-jyeot-da.", "Khoảng cách giữa hai người đã xa cách."),
         ("안전 거리를 유지하세요.", "An-jeon geo-ri-reul yu-ji-ha-se-yo.", "Hãy giữ khoảng cách an toàn."),
         ("이 도시는 거리가 넓어서 자동차가 필요하다.", "I do-si-neun geo-ri-ga neol-eo-seo ja-dong-cha-ga pil-yo-ha-da.", "Thành phố này khoảng cách rộng nên cần ô tô."),
         ("마라톤은 장거리 경기이다.", "Ma-ra-ton-eun jang-geo-ri gyeong-gi-i-da.", "Marathon là môn thi đấu đường dài."),
         ("사회적 거리두기가 해제되었다.", "Sa-hoe-jeok geo-ri-du-gi-ga hae-je-doe-eot-da.", "Giãn cách xã hội đã được dỡ bỏ."),
     ],
     [
         ("간격", "間隔", "khoảng cách, quãng"),
         ("근접", "近接", "cận tiếp, gần gũi"),
         ("장거리", "長距離", "đường dài, xa"),
         ("단거리", "短距離", "đường ngắn, gần"),
     ],
     'Hãy nghĩ đến hai người đứng "CỰ" (거) xa nhau đến mức "LY" (리) tán. Càng đứng xa, khoảng cách (거리) càng lớn.'),
    ("걱정", "擔情", "lo lắng, bận tâm",
     '"擔" (걱, đảm) nghĩa là gánh vác, đảm đương; "情" (정, tình) nghĩa là tình cảm. Hợp lại chỉ sự băn khoăn, sợ điều xấu sẽ xảy ra.',
     [
         ("아이가 늦게 오는 걸 걱정하고 있다.", "A-i-ga neut-ge o-neun geol geok-jeong-ha-go it-da.", "Tôi đang lo lắng vì con về muộn."),
         ("걱정 마세요. 잘될 거예요.", "Geok-jeong ma-se-yo. Jal-dwel geo-ye-yo.", "Đừng lo lắng. Mọi thứ sẽ ổn thôi."),
         ("쓸데없는 걱정은 건강을 해친다.", "Sseul-de-eom-neun geok-jeong-eun geon-gang-eul hae-chin-da.", "Lo lắng vô cớ làm hại sức khỏe."),
         ("시험 결과에 대해 걱정이 많다.", "Si-heom gyeol-gwa-e dae-hae geok-jeong-i manh-da.", "Tôi rất lo lắng về kết quả thi."),
         ("엄마는 늘 나를 걱정하신다.", "Eom-ma-neun neul na-reul geok-jeong-ha-sin-da.", "Mẹ luôn lo lắng cho tôi."),
         ("돈 걱정 없이 살고 싶다.", "Don geok-jeong eop-si sal-go sip-da.", "Tôi muốn sống mà không lo lắng về tiền."),
     ],
     [
         ("우려", "憂慮", "ưu lự, lo ngại"),
         ("불안", "不安", "bất an, lo âu"),
         ("안심", "安心", "an tâm, yên lòng"),
         ("심란", "心亂", "tâm loạn, bối rối"),
     ],
     'Hãy nghĩ đến người "ĐẢM" (걱) đương cả núi "TÌNH" (정) cảm lo âu. Càng nghĩ nhiều càng lo lắng (걱정) — đó là bản chất của người mẹ.'),
    ("검사", "檢査", "kiểm tra, thanh tra",
     '"檢" (검, kiểm) nghĩa là xem xét, kiểm tra; "査" (사, tra) nghĩa là tra cứu, xét hỏi. Hợp lại chỉ việc xem xét, đánh giá tình trạng, chất lượng.',
     [
         ("병원에서 건강 검사를 받았다.", "Byeong-won-e-seo geon-gang geom-sa-reul bat-at-da.", "Tôi đã đi khám sức khỏe ở bệnh viện."),
         ("세관에서 짐을 검사했다.", "Se-gwan-e-seo jim-eul geom-sa-haet-da.", "Hải quan đã kiểm tra hành lý."),
         ("검사 결과가 다음 주에 나온다.", "Geom-sa gyeol-gwa-ga da-eum ju-e na-on-da.", "Kết quả kiểm tra sẽ có vào tuần sau."),
         ("경찰이 현장을 검사하고 있다.", "Gyeong-chal-i hyeon-jang-eul geom-sa-ha-go it-da.", "Cảnh sát đang khám nghiệm hiện trường."),
         ("음식 위생 검사가 철저해야 한다.", "Eum-sik wi-saeng geom-sa-ga cheol-jeo-hae-ya han-da.", "Kiểm tra vệ sinh thực phẩm phải nghiêm ngặt."),
         ("검사관이 증거를 수집하고 있다.", "Geom-sa-gwan-i jeung-geo-reul su-jip-ha-go it-da.", "Thanh tra viên đang thu thập chứng cứ."),
     ],
     [
         ("조사", "調査", "điều tra"),
         ("심사", "審査", "thẩm tra"),
         ("점검", "點檢", "điểm kiểm, kiểm tra"),
         ("감사", "監査", "giám tra"),
     ],
     'Hãy nghĩ đến người "KIỂM" (검) soát từng chi tiết, "TRA" (사) xét kỹ lưỡng. Công việc của thanh tra (검사) là kiểm tra từng thứ một.'),
    ("검토", "檢討", "xem xét, nghiên cứu",
     '"檢" (검, kiểm) nghĩa là xem xét; "討" (토, thảo) nghĩa là bàn luận, luận bàn. Hợp lại chỉ việc xem xét kỹ lưỡng, đánh giá ưu nhược điểm trước khi quyết định.',
     [
         ("이 문제를 다시 검토해야 한다.", "I mun-je-reul da-si geom-to-hae-ya han-da.", "Cần xem xét lại vấn đề này."),
         ("계획안을 검토 중입니다.", "Gye-hwa-ga-neul geom-to jung-im-ni-da.", "Đang trong quá trình xem xét phương án."),
         ("검토 후 답변 드리겠습니다.", "Geom-to hu dap-byeon deu-ri-get-seup-ni-da.", "Sau khi xem xét tôi sẽ trả lời."),
         ("위원회에서 예산을 검토하고 있다.", "Wi-won-hoe-e-seo ye-san-eul geom-to-ha-go it-da.", "Ủy ban đang xem xét ngân sách."),
         ("검토 결과를 보고서에 담았다.", "Geom-to gyeol-gwa-reul bo-go-seo-e dam-at-da.", "Đã đưa kết quả xem xét vào báo cáo."),
         ("변경 사항에 대해 검토를 요청했다.", "Byeon-kyeong sa-hang-e dae-hae geom-to-reul yo-cheong-haet-da.", "Đã yêu cầu xem xét về các thay đổi."),
     ],
     [
         ("검토하다", "-", "xem xét, nghiên cứu"),
         ("검토안", "檢討案", "phương án xem xét"),
         ("재검토", "再檢討", "xem xét lại"),
         ("심의", "審議", "thẩm nghị, thảo luận"),
     ],
     'Hãy nghĩ đến cuộc họp "KIỂM" (검) lại từng điểm rồi "THẢO" (토) luận. Xem xét (검토) kỹ trước khi quyết định là điều khôn ngoan.'),
    ("게시", "揭示", "đăng, niêm yết",
     '"揭" (게, yết) nghĩa là vạch ra, mở ra; "示" (시, thị) nghĩa là cho thấy, biểu thị. Hợp lại chỉ việc công bố, đăng thông tin cho mọi người biết.',
     [
         ("공지사항을 게시판에 게시했다.", "Gong-ji-sa-hang-eul ge-si-ban-e ge-si-haet-da.", "Đã đăng thông báo lên bảng tin."),
         ("채용 공고를 홈페이지에 게시했다.", "Chae-yong gong-go-reul hom-pei-ji-e ge-si-haet-da.", "Đã đăng thông báo tuyển dụng lên website."),
         ("게시된 내용을 확인하세요.", "Ge-si-doen nae-yong-eul hwak-in-ha-se-yo.", "Hãy kiểm tra nội dung đã đăng."),
         ("이 글은 삭제되었으므로 게시할 수 없다.", "I geul-eun sal-je-doe-eot-eu-mu-ro ge-si-hal su eop-da.", "Bài này đã bị xóa nên không thể đăng lại."),
         ("학교 게시판에 합격자 명단이 게시되었다.", "Hak-gyo ge-si-ban-e hap-gyeok-ja myeong-dan-i ge-si-doe-eot-da.", "Danh sách trúng tuyển đã được niêm yết trên bảng trường."),
         ("광고를 게시하기 위해서는 승인이 필요하다.", "Gwang-go-reul ge-si-ha-gi wi-hae-seo-neun seung-in-i pil-yo-ha-da.", "Đăng quảng cáo cần có sự phê duyệt."),
     ],
     [
         ("공고", "公告", "công cáo, thông báo"),
         ("포스팅", "-", "đăng bài"),
         ("발표", "發表", "phát biểu, công bố"),
         ("게시판", "揭示板", "bảng tin, bảng thông báo"),
     ],
     'Hãy nghĩ đến việc "YẾT" (게) mở bảng và "THỊ" (시) ra cho mọi người xem. Đăng tin (게시) lên bảng là cách thông báo công khai.'),
    ("견고", "堅固", "kiên cố, vững chắc",
     '"堅" (견, kiên) nghĩa là cứng, bền; "固" (고, cố) nghĩa là chắc chắn, bền vững. Hợp lại chỉ sự vững chãi, khó bị phá vỡ hoặc lay chuyển.',
     [
         ("이 집은 구조가 견고하다.", "I jib-eun gu-jo-ga gyeon-go-ha-da.", "Ngôi nhà này có kết cấu kiên cố."),
         ("견고한 우정은 세월을 견딘다.", "Gyeon-go-han u-jeong-eun se-wol-eul gyeon-din-da.", "Tình bạn vững chắc chịu được thử thách thời gian."),
         ("기초를 견고하게 다져야 한다.", "Gi-cho-reul gyeon-go-ha-ge da-jyeo-ya han-da.", "Cần xây dựng nền tảng vững chắc."),
         ("견고한 신념이 성공의 토대이다.", "Gyeon-go-han sin-nyeom-i seong-gong-ui to-dae-i-da.", "Niềm tin vững chắc là nền tảng của thành công."),
         ("성벽이 견고하여 적의 공격을 막았다.", "Seong-byeok-i gyeon-go-ha-yeo jeok-ui gong-gyeok-eul mak-at-da.", "Tường thành kiên cố đã chặn đợt tấn công của quân địch."),
         ("견고한 근육을 만들기 위해 운동한다.", "Gyeon-go-han geun-yuk-eul man-deul-gi wi-hae un-dong-han-da.", "Tôi tập thể dục để xây dựng cơ bắp săn chắc."),
     ],
     [
         ("튼튼", "-", "chắc chắn, khỏe"),
         ("특고", "特固", "đặc cố, đặc biệt vững"),
         ("확고", "確固", "xác cố, kiên định"),
         ("취약", "脆弱", "tổn thương, yếu ớt"),
     ],
     'Hãy nghĩ đến tòa thành "KIÊN" (견) trì đứng vững, "CỐ" (고) nhiên không gục ngã. Xây kiên cố (견고) như thành đồng vách sắt.'),
    ("견해", "見解", "quan điểm, nhận thức",
     '"見" (견, kiến) nghĩa là nhìn thấy, gặp gỡ; "解" (해, giải) nghĩa là giải thích, hiểu rõ. Hợp lại chỉ cách nhìn nhận, đánh giá về một vấn đề.',
     [
         ("나의 견해는 조금 다르다.", "Na-ui gyeon-hai-neun jo-geum da-reu-da.", "Quan điểm của tôi hơi khác."),
         ("전문가들의 견해를 들어보자.", "Jeon-mun-ga-deul-ui gyeon-hai-reul deu-eo-bo-ja.", "Hãy nghe quan điểm của các chuyên gia."),
         ("정치적 견해가 달라도 친구이다.", "Jeong-chi-jeok gyeon-hai-ga dal-ra-do chin-gu-i-da.", "Khác quan điểm chính trị nhưng vẫn là bạn."),
         ("이 문제에 대한 너의 견해는 무엇이니?", "I mun-je-e dae-han neo-ui gyeon-hai-neun mu-eo-si-ni?", "Quan điểm của bạn về vấn đề này là gì?"),
         ("견해를 존중하는 것이 중요하다.", "Gyeon-hai-reul jon-jung-ha-neun geot-i jung-yo-ha-da.", "Tôn trọng quan điểm của nhau là quan trọng."),
         ("나는 그의 견해에 동의하지 않는다.", "Na-neun geu-ui gyeon-hai-e dong-ui-ha-ji an-neun-da.", "Tôi không đồng ý với quan điểm của anh ấy."),
     ],
     [
         ("의견", "意見", "ý kiến"),
         ("관점", "觀點", "quan điểm, góc nhìn"),
         ("시각", "視角", "thị giác, góc nhìn"),
         ("입장", "立場", "lập trường"),
     ],
     'Hãy nghĩ đến việc "KIẾN" (견) thấy một vấn đề và "GIẢI" (해) thích theo cách riêng. Mỗi người có một quan điểm (견해) khác nhau.'),
    ("결석", "缺席", "vắng mặt",
     '"缺" (결, khuyết) nghĩa là thiếu, hụt; "席" (석, tịch) nghĩa là chỗ ngồi. Hợp lại chỉ việc không có mặt ở nơi cần phải đến.',
     [
         ("병 때문에 수업에 결석했다.", "Byeong ttae-mun-e su-eop-e gyeol-seok-haet-da.", "Tôi đã vắng mặt buổi học vì bệnh."),
         ("결석 사유서를 제출해야 한다.", "Gyeol-seok sa-yu-seo-reul je-chul-hae-ya han-da.", "Cần nộp đơn xin phép vắng mặt."),
         ("그는 회의에 결석했다.", "Geu-neun hoe-ui-e gyeol-seok-haet-da.", "Anh ấy đã vắng mặt cuộc họp."),
         ("무단 결석은 출석 점수에 반영된다.", "Mu-dan gyeol-seok-eun chul-seok jeom-su-e ban-yeong-doen-da.", "Vắng mặt tự ý sẽ ảnh hưởng điểm chuyên cần."),
         ("3일 이상 결석하면 보충 수업이 필요하다.", "Sam-il i-sang gyeol-seok-ha-myeon bo-chung su-eop-i pil-yo-ha-da.", "Vắng mặt trên 3 ngày cần học bổ sung."),
         ("결석률이 높아지면 학교에서 연락이 온다.", "Gyeol-seok-ryul-i no-a-ji-myeon hak-gyo-e-seo yeon-rak-i on-da.", "Tỷ lệ vắng mặt tăng thì trường sẽ liên lạc."),
     ],
     [
         ("출석", "出席", "xuất tịch, có mặt"),
         ("병가", "病假", "bệnh giả, nghỉ bệnh"),
         ("조퇴", "早退", "tảo thoái, về sớm"),
         ("지각", "遲刻", "trễ, đến muộn"),
     ],
     'Hãy nghĩ đến chỗ ngồi "KHUYẾT" (결) thiếu một người, "TỊCH" (석) vị trống không. Đó là ai đó vắng mặt (결석).'),
    ("결심", "決心", "quyết tâm",
     '"決" (결, quyết) nghĩa là quyết định, giải quyết; "心" (심, tâm) nghĩa là trái tim, tâm trí. Hợp lại chỉ sự kiên quyết làm điều gì đó.',
     [
         ("이번에는 반드시 성공하겠다고 결심했다.", "I-beon-e-neun ban-deu-si seong-gong-ha-get-da-go gyeol-sim-haet-da.", "Tôi đã quyết tâm lần này nhất định thành công."),
         ("그녀는 다이어트를 결심했다.", "Geu-nyeo-neun da-i-eo-teu-reul gyeol-sim-haet-da.", "Cô ấy đã quyết tâm giảm cân."),
         ("결심은 했는데 실행이 어렵다.", "Gyeol-sim-eun haet-neun-de sil-haeng-i eo-ryeop-da.", "Đã quyết tâm nhưng khó thực hiện."),
         ("한 번 결심하면 끝까지 가야 한다.", "Han beon gyeol-sim-ha-myeon ggeut-kka-ji ga-ya han-da.", "Một khi quyết tâm phải đi đến cùng."),
         ("그의 결심이 대단해 보인다.", "Geu-ui gyeol-sim-i dae-dan-hae bo-in-da.", "Quyết tâm của anh ấy trông thật phi thường."),
         ("오랫동안 망설이다가 마침내 결심했다.", "O-raet-dong-an mang-seol-i-da-ga ma-chim-nae gyeol-sim-haet-da.", "Lưỡng lự lâu rồi cuối cùng cũng quyết tâm."),
     ],
     [
         ("각오", "覺悟", "giác ngộ, quyết tâm"),
         ("의지", "意志", "ý chí"),
         ("마음먹기", "-", "quyết định, đặt lòng"),
         ("동기", "動機", "động cơ"),
     ],
     'Hãy nghĩ đến trái tim "QUYẾT" (결) định không lay chuyển. Khi tâm trí kiên định — đó là quyết tâm (결심).'),
    ("결정", "決定", "quyết định",
     '"決" (결, quyết) nghĩa là quyết định, giải quyết; "定" (정, định) nghĩa là xác định, ổn định. Hợp lại chỉ việc chọn một phương án sau khi cân nhắc.',
     [
         ("중요한 결정을 내려야 하는 순간이다.", "Jung-yo-han gyeol-jeong-eul nae-ryeo-ya ha-neun sun-gan-i-da.", "Đây là khoảnh khắc phải đưa ra quyết định quan trọng."),
         ("그 결정에 후회하고 있다.", "Geu gyeol-jeong-e hu-hoe-ha-go it-da.", "Anh ấy đang hối hận về quyết định đó."),
         ("결정이 쉽지 않다.", "Gyeol-jeong-i swip-ji an-ta.", "Quyết định không dễ dàng."),
         ("최종 결정은 사장님이 내리신다.", "Choe-jong gyeol-jeong-eun sa-jang-nim-i nae-ri-sin-da.", "Quyết định cuối cùng do giám đốc đưa ra."),
         ("결정을 미루지 마라.", "Gyeol-jeong-eul mi-ru-ji ma-ra.", "Đừng trì hoãn quyết định."),
         ("그녀의 결정을 존중해야 한다.", "Geu-nyeo-ui gyeol-jeong-eul jon-jung-hae-ya han-da.", "Cần tôn trọng quyết định của cô ấy."),
     ],
     [
         ("판단", "判斷", "phán đoán"),
         ("선택", "選擇", "tuyển trạch, lựa chọn"),
         ("판결", "判決", "phán quyết"),
         ("결론", "結論", "kết luận"),
     ],
     'Hãy nghĩ đến ngã rẽ đường, bạn "QUYẾT" (결) định chọn lối "ĐỊNH" (정) rõ. Đó là quyết định (결정) — không thể đi ngược lại.'),
    ("결혼", "結婚", "kết hôn",
     '"結" (결, kết) nghĩa là kết nối, buộc; "婚" (혼, hôn) nghĩa là hôn nhân. Hợp lại chỉ việc hai người trở thành vợ chồng theo pháp luật hoặc tập quán.',
     [
         ("내년에 결혼할 예정이다.", "Nae-nyeon-e gyeol-hon-hal ye-jeong-i-da.", "Dự định năm sau kết hôn."),
         ("결혼식은 교회에서 열린다.", "Gyeol-hon-sik-eun gyo-hoe-e-seo yeol-rin-da.", "Lễ cưới tổ chức tại nhà thờ."),
         ("그들은 대학에서 만나 결혼했다.", "Geu-deul-eun dae-hak-e-seo man-na gyeol-hon-haet-da.", "Họ gặp nhau ở đại học rồi kết hôn."),
         ("결혼 생활이 행복하길 바란다.", "Gyeol-hon saeng-hwal-i haeng-bok-ha-gil ba-ran-da.", "Mong cuộc sống hôn nhân hạnh phúc."),
         ("결혼 10주년을 축하했습니다.", "Gyeol-hon sip-ju-nyeon-eul chuk-ha-haet-seup-ni-da.", "Chúc mừng kỷ niệm 10 năm ngày cưới."),
         ("그는 결혼을 하고 싶지 않다고 했다.", "Geu-neun gyeol-hon-eul ha-go sip-ji an-ta-go haet-da.", "Anh ấy nói không muốn kết hôn."),
     ],
     [
         ("혼인", "婚姻", "hôn nhân"),
         ("이혼", "離婚", "ly hôn"),
         ("신혼", "新婚", "tân hôn, mới cưới"),
         ("부부", "夫婦", "phu phụ, vợ chồng"),
     ],
     'Hãy nghĩ đến sợi dây đỏ "KẾT" (결) buộc hai người thành "HÔN" (혼) nhân. Kết hôn (결혼) là buộc sợi chỉ đỏ vĩnh viễn.'),
    ("경계", "警戒", "cảnh giác",
     '"警" (경, cảnh) nghĩa là cảnh báo, đề phòng; "戒" (계, giới) nghĩa là ngăn cấm, răn dạy. Hợp lại chỉ sự đề phòng, cẩn thận trước nguy hiểm.',
     [
         ("적의 움직임에 경계를 해야 한다.", "Jeok-ui um-jik-im-e gyeong-gye-reul hae-ya han-da.", "Cần cảnh giác trước động thái của địch."),
         ("경계가 느슨해지면 사고가 발생한다.", "Gyeong-gye-ga neu-seu-hae-ji-myeon sa-go-ga bal-saeng-han-da.", "Cảnh giác lơi là sẽ xảy ra tai nạn."),
         ("군인들은 국경에서 경계하고 있다.", "Gun-in-deul-eun guk-gyeong-e-seo gyeong-gye-ha-go it-da.", "Binh sĩ đang canh gác ở biên giới."),
         ("그 뉴스를 듣고 경계심이 생겼다.", "Geu nyu-seu-reul deut-go gyeong-gye-sim-i saeng-gyeot-da.", "Nghe tin đó mà sinh ra lòng cảnh giác."),
         ("경계선을 넘으면 안 된다.", "Gyeong-gye-seon-eul neom-eu-myeon an doen-da.", "Không được vượt qua đường ranh giới."),
         ("주변 환경에 항상 경계를 유지하라.", "Ju-byeon hwan-gyeong-e hang-sang gyeong-gye-reul yu-ji-ha-ra.", "Luôn duy trì cảnh giác với môi trường xung quanh."),
     ],
     [
         ("경보", "警報", "cảnh báo"),
         ("위협", "威脅", "uy hiếp, đe dọa"),
         ("방어", "防禦", "phòng ngự, phòng thủ"),
         ("선", "線", "ranh giới, đường"),
     ],
     'Hãy nghĩ đến người lính "CẢNH" (경) báo có giặc và "GIỚI" (계) bị không được ngủ. Phải luôn cảnh giác (경계).'),
    ("경고", "警告", "cảnh cáo",
     '"警" (경, cảnh) nghĩa là cảnh báo; "告" (고, cáo) nghĩa là báo cho biết. Hợp lại chỉ lời nhắc nhở nghiêm túc về hậu quả xấu có thể xảy ra.',
     [
         ("선생님은 그에게 경고를 주셨다.", "Seon-saeng-nim-eun geu-e-ge gyeong-go-reul ju-syeot-da.", "Thầy đã cảnh cáo cậu ấy."),
         ("흡연 금지 구역이라는 경고판이 붙어 있다.", "Heup-yeon geum-ji gu-yeo-ki-ra-neun gyeong-go-pan-i but-eo it-da.", "Có biển cảnh báo khu vực cấm hút thuốc."),
         ("경고를 무시하면 안 된다.", "Gyeong-go-reul mu-si-ha-myeon an doen-da.", "Không được phớt lờ cảnh báo."),
         ("세 번째 경고면 퇴장이다.", "Se beon-jjae gyeong-go-myeon toe-jang-i-da.", "Cảnh cáo lần ba là phải ra khỏi."),
         ("소방서에서 화재 경고를 발령했다.", "So-bang-seo-e-seo hwa-gae gyeong-go-reul bal-ryeong-haet-da.", "Phòng cháy đã phát lệnh cảnh báo hỏa hoạn."),
         ("그의 말은 일종의 경고였다.", "Geu-ui mal-eun il-jong-ui gyeong-go-i-eot-da.", "Lời nói của anh ấy là một lời cảnh báo."),
     ],
     [
         ("주의", "注意", "chú ý"),
         ("경고하다", "-", "cảnh cáo"),
         ("처벌", "處罰", "xử phạt"),
         ("금지", "禁止", "cấm chỉ"),
     ],
     'Hãy nghĩ đến còi báo động "CẢNH" (경) báo nguy hiểm, "CÁO" (고) tri cho mọi người. Đó là cảnh cáo (경고) — nghe thì phải dừng lại.'),
    ("경력", "經歷", "kinh nghiệm",
     '"經" (경, kinh) nghĩa là trải qua, kinh nghiệm; "歷" (력, lịch) nghĩa là lịch sử, trải qua. Hợp lại chỉ quá trình làm việc, trải nghiệm đã tích lũy.',
     [
         ("그는 10년의 경력을 가진 개발자이다.", "Geu-neun sip-nyeon-ui gyeong-ryeok-eul ga-jin gae-bal-ja-i-da.", "Anh ấy là lập trình viên có 10 năm kinh nghiệm."),
         ("경력이 풍부해서 신뢰가 간다.", "Gyeong-ryeok-i pung-bu-hae-seo sin-noe-ga gan-da.", "Kinh nghiệm phong phú nên đáng tin cậy."),
         ("이 직무에는 관련 경력이 필요하다.", "I jik-mu-e-neun gwan-ryeon gyeong-ryeok-i pil-yo-ha-da.", "Công việc này cần kinh nghiệm liên quan."),
         ("경력 사항을 이력서에 기입하세요.", "Gyeong-ryeok sa-hang-eul i-ryeok-seo-e gi-ip-ha-se-yo.", "Hãy điền kinh nghiệm làm việc vào sơ yếu lý lịch."),
         ("신입보다 경력직을 선호한다.", "Sin-ip-bo-da gyeong-ryeok-jik-eul seon-ho-han-da.", "Họ ưu tiên người có kinh nghiệm hơn tân binh."),
         ("그녀의 경력은 매우 인상적이다.", "Geu-nyeo-ui gyeong-ryeok-eun mae-u in-sang-jeok-i-da.", "Kinh nghiệm của cô ấy rất ấn tượng."),
     ],
     [
         ("경험", "經驗", "kinh nghiệm"),
         ("이력", "履歷", "lý lịch, sơ yếu"),
         ("연차", "年次", "năm thứ, thâm niên"),
         ("자격", "資格", "tư cách, bằng cấp"),
     ],
     'Hãy nghĩ đến cuốn "KINH" (경) sách ghi chép lịch "LỊCH" (력) sử đời người. Kinh nghiệm (경력) chính là những trang sách đó.'),
    ("경쟁", "競爭", "cạnh tranh",
     '"競" (경, đối/cạnh) nghĩa là tranh đua, ganh đua; "爭" (쟁, tranh) nghĩa là tranh giành, đấu tranh. Hợp lại chỉ sự đua tranh để giành lợi ích, vị trí.',
     [
         ("시장 경쟁이 매우 치열하다.", "Si-jang gyeong-jaeng-i mae-u chi-yeol-ha-da.", "Cạnh tranh thị trường rất khốc liệt."),
         ("공정한 경쟁을 해야 한다.", "Gong-jeong-han gyeong-jaeng-eul hae-ya han-da.", "Phải cạnh tranh một cách công bằng."),
         ("그는 형과 경쟁하며 자랐다.", "Geu-neun hyeong-gwa gyeong-jaeng-ha-myeo ja-rat-da.", "Anh ấy lớn lên cạnh tranh với anh trai."),
         ("경쟁에서 이기려면 노력이 필요하다.", "Gyeong-jaeng-e-seo i-gi-ryeo-myeon no-ryeok-i pil-yo-ha-da.", "Muốn thắng trong cạnh tranh cần phải nỗ lực."),
         ("불법 경쟁은 금지되어 있다.", "Bul-beop gyeong-jaeng-eun geum-ji-doe-eo it-da.", "Cạnh tranh bất hợp pháp bị cấm."),
         ("경쟁 상대를 존중하는 것이 중요하다.", "Gyeong-jaeng sang-dae-reul jon-jung-ha-neun geot-i jung-yo-ha-da.", "Tôn trọng đối thủ cạnh tranh là quan trọng."),
     ],
     [
         ("대결", "對決", "đối quyết, đối đầu"),
         ("경쟁력", "競爭力", "năng lực cạnh tranh"),
         ("협력", "協力", "hợp lực, hợp tác"),
         ("독점", "獨占", "độc chiếm"),
     ],
     'Hãy nghĩ đến hai người chạy đua "ĐỐI" (경) nhau, "TRANH" (쟁) giành vạch đích. Cạnh tranh (경쟁) là cuộc đua không có chỗ cho người thứ hai.'),
    ("경제", "經濟", "kinh tế",
     '"經" (경, kinh) nghĩa là kinh qua, quản lý; "濟" (제, tế) nghĩa là giúp đỡ, vượt qua. Hợp lại chỉ hệ thống sản xuất, phân phối, tiêu dùng trong xã hội.',
     [
         ("경제 성장률이 둔화되고 있다.", "Gyeong-je seong-jang-ryul-i dun-hwa-doe-go it-da.", "Tốc độ tăng trưởng kinh tế đang chậm lại."),
         ("세계 경제가 불황이다.", "Se-gye gyeong-je-ga bul-hwang-i-da.", "Kinh tế thế giới đang suy thoái."),
         ("경제 공부를 대학에서 했다.", "Gyeong-je gong-bu-reul dae-hak-e-seo haet-da.", "Tôi đã học kinh tế ở đại học."),
         ("경제적 자유가 중요하다고 생각한다.", "Gyeong-je-jeok ja-yu-ga jung-yo-ha-da-go saeng-gak-han-da.", "Tôi nghĩ tự do kinh tế là quan trọng."),
         ("정부는 경제 정책을 발표했다.", "Jeong-bu-neun gyeong-je jeong-chaek-eul bal-pyo-haet-da.", "Chính phủ đã công bố chính sách kinh tế."),
         ("개인 경제 상황이 좋아지고 있다.", "Gae-in gyeong-je sang-hwang-i jo-a-ji-go it-da.", "Tình hình kinh tế cá nhân đang khá hơn."),
     ],
     [
         ("금융", "金融", "kim dung, tài chính"),
         ("산업", "産業", "sản nghiệp, công nghiệp"),
         ("무역", "貿易", "mậu dịch, thương mại"),
         ("시장", "市場", "thị trường, chợ"),
     ],
     'Hãy nghĩ đến việc "KINH" (경) quản nguồn lực để "TẾ" (제) vượt qua khó khăn. Kinh tế (경제) là bánh xe vận hành xã hội.'),
    ("경찰", "警察", "cảnh sát",
     '"警" (경, cảnh) nghĩa là cảnh giác, đề phòng; "察" (찰, sát) nghĩa là quan sát, xem xét. Hợp lại chỉ lực lượng duy trì trật tự, bắt tội phạm.',
     [
         ("경찰에 신고했다.", "Gyeong-chal-e sin-go-haet-da.", "Tôi đã báo cảnh sát."),
         ("경찰관이 교통을 통제하고 있다.", "Gyeong-chal-gwan-i gyo-tong-eul tong-je-ha-go it-da.", "Cảnh sát đang điều khiển giao thông."),
         ("도둑을 경찰이 잡았다.", "Do-dug-eul gyeong-chal-i jab-at-da.", "Cảnh sát đã bắt được kẻ trộm."),
         ("112는 경찰 신고 전화번호이다.", "I-il-i-neun gyeong-chal sin-go jeon-hwa-beon-ho-i-da.", "112 là số điện thoại báo cảnh sát."),
         ("경찰서에서 조사를 받았다.", "Gyeong-chal-seo-e-seo jo-sa-reul bat-at-da.", "Tôi đã bị điều tra tại đồn cảnh sát."),
         ("경찰복을 입은 사람이 문을 두드렸다.", "Gyeong-chal-bog-eul ib-eun sa-ram-i mun-eul du-deu-ryeot-da.", "Người mặc đồng phục cảnh sát gõ cửa."),
     ],
     [
         ("순경", "巡警", "tuần cảnh, cảnh sát"),
         ("형사", "刑事", "hình sự, điều tra viên"),
         ("법률", "法律", "pháp luật"),
         ("치안", "治安", "trị an, an ninh"),
     ],
     'Hãy nghĩ đến người "CẢNH" (경) giác canh gác, "SÁT" (찰) xét mọi hành vi. Cảnh sát (경찰) luôn để mắt đến kẻ xấu.'),
    ("경치", "景致", "phong cảnh",
     '"景" (경, cảnh) nghĩa là cảnh sắc, quang cảnh; "致" (치, trí) nghĩa là đạt đến, gửi đến. Hợp lại chỉ vẻ đẹp thiên nhiên hoặc không gian nhìn thấy.',
     [
         ("산의 경치가 아름답다.", "San-ui gyeong-chi-ga a-reum-dap-da.", "Phong cảnh núi đẹp."),
         ("경치 좋은 카페를 찾았다.", "Gyeong-chi jo-eun ka-pe-reul cha-jat-da.", "Tôi đã tìm thấy quán cà phê có phong cảnh đẹp."),
         ("바다 경치를 보며 힐링했다.", "Ba-da gyeong-chi-reul bo-myeo hil-ring-haet-da.", "Tôi thư giãn ngắm cảnh biển."),
         ("가을 경치가 참으로 spectacular하다.", "Ga-eul gyeong-chi-ga cha-meuro spectacular-ha-da.", "Phong cảnh mùa thu thật hùng vĩ."),
         ("이 공원은 경치가 뛰어나다.", "I gong-won-eun gyeong-chi-ga ddwi-eo-na-da.", "Công viên này có phong cảnh xuất sắc."),
         ("경치 사진을 많이 찍었다.", "Gyeong-chi sa-jin-eul man-hi jjig-eot-da.", "Tôi đã chụp rất nhiều ảnh phong cảnh."),
     ],
     [
         ("풍경", "風景", "phong cảnh"),
         ("광경", "光景", "quang cảnh"),
         ("명소", "名所", "danh thắng"),
         ("전망", "展望", "triển vọng, tầm nhìn"),
     ],
     'Hãy nghĩ đến "CẢNH" (경) sắc đẹp đến "TRÍ" (치) mức không thể rời mắt. Phong cảnh (경치) đẹp làm người ta ngây ngất.'),
    ("경향", "傾向", "khuynh hướng",
     '"傾" (경, khuynh) nghĩa là nghiêng về, đổ về; "向" (향, hướng) nghĩa là hướng đến, xu hướng. Hợp lại chỉ xu hướng phát triển theo một hướng nhất định.',
     [
         ("최근 물가 상승 경향이 있다.", "Choe-geun mul-ga sang-seung gyeong-hyang-i it-da.", "Gần đây có khuynh hướng giá cả tăng."),
         ("젊은 세대의 소비 경향이 변했다.", "Jeol-meun se-dae-ui so-bi gyeong-hyang-i byeon-haet-da.", "Khuynh hướng tiêu dùng của giới trẻ đã thay đổi."),
         ("이 문제에 대한 사회적 경향을 주목해야 한다.", "I mun-je-e dae-han sa-hoe-jeok gyeong-hyang-eul ju-mok-hae-ya han-da.", "Cần chú ý khuynh hướng xã hội về vấn đề này."),
         ("경향을 역행하는 것은 어렵다.", "Gyeong-hyang-eul yeok-haeng-ha-neun geot-eun eo-ryeop-da.", "Đi ngược khuynh hướng là điều khó."),
         ("정치적 경향이 비슷한 사람들끼리 모인다.", "Jeong-chi-jeok gyeong-hyang-i bi-sut-han sa-ram-deul-kki-ri mo-in-da.", "Người có khuynh hướng chính trị giống nhau tụ tập lại."),
         ("취업 경향은 점점 비대면으로 바뀌고 있다.", "Chwi-eop gyeong-hyang-eun jeom-jeom bi-dae-myeon-eu-ro ba-kkwi-go it-da.", "Khuynh hướng tuyển dụng ngày càng chuyển sang trực tuyến."),
     ],
     [
         ("추세", "趨勢", "xu thế"),
         ("방향", "方向", "phương hướng"),
         ("흐름", "-", "dòng chảy, xu hướng"),
         ("유행", "流行", "lưu hành, phổ biến"),
     ],
     'Hãy nghĩ đến cái cân nghiêng "KHUYNH" (경) về một "HƯỚNG" (향). Khi đa số đổ về một phía — đó là khuynh hướng (경향).'),
    ("계기", "契機", "cơ hội, cơ hội thuận lợi",
     '"契" (계, khế) nghĩa là khế ước, cơ hội; "機" (기, cơ) nghĩa là cơ hội, máy móc. Hợp lại chỉ thời điểm thuận lợi để làm điều gì đó.',
     [
         ("이 일은 인생의 계기가 되었다.", "I il-eun in-saeng-ui gye-gi-ga doe-eot-da.", "Việc này đã trở thành cơ hội của đời tôi."),
         ("계기를 놓치지 마라.", "Gye-gi-reul no-chi-ji ma-ra.", "Đừng bỏ lỡ cơ hội."),
         ("이번 사건은 변화의 계기가 될 수 있다.", "I-beon sa-geon-eun byeon-hwa-ui gye-gi-ga doel su it-da.", "Sự kiện này có thể là cơ hội thay đổi."),
         ("유학이 그의 삶의 계기가 되었다.", "Yu-hak-i geu-ui sam-ui gye-gi-ga doe-eot-da.", "Du học đã trở thành bước ngoặt cuộc đời anh ấy."),
         ("좋은 계기를 만들어야 한다.", "Jo-eun gye-gi-reul man-deul-eo-ya han-da.", "Cần tạo ra cơ hội tốt."),
         ("실패는 성공의 계기가 될 수 있다.", "Sil-pae-neun seong-gong-ui gye-gi-ga doel su it-da.", "Thất bại có thể là cơ hội của thành công."),
     ],
     [
         ("기회", "機會", "cơ hội"),
         ("전환점", "轉換點", "điểm chuyển biến"),
         ("발판", "發板", "bàn đạp"),
         ("시작", "始作", "bắt đầu"),
     ],
     'Hãy nghĩ đến "KHẾ" (계) ước gặp đúng "CƠ" (기) hội. Khi cửa mở ra — đó là cơ hội (계기), phải bước qua ngay.'),
]

def make_word(w):
    hangul, hanja, short_meaning, meaning, examples, related, mnemonic = w
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
    out = ["# Phan 004 Hanja Vocabulary\n"]
    for w in WORDS:
        out.append(make_word(w))
    
    filepath = r"C:\Users\hi\Desktop\code\han\tam\Phan_004.md"
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write("\n".join(out))
    
    print(f"✅ Đã tạo: {filepath}")
    print(f"   Tổng số từ: {len(WORDS)}")
    print(f"   ID trên DB: 163 – {163 + len(WORDS) - 1}")
    print(f"   Số thứ tự web: #64 – #{163 + len(WORDS) - 100}")

if __name__ == "__main__":
    main()
