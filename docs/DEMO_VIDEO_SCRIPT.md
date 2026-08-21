# 🎬 Kịch Bản Video Demo (3–5 Phút) — Wealify Guardian

> **Đề tài:** WLF-01 · Wealify — Quản lý chi tiêu & an toàn giao dịch  
> **Thời lượng chuẩn:** 4 phút 30 giây  
> **Phong cách:** Chuyên nghiệp, trực quan, nhịp độ nhanh, tập trung vào giá trị bảo vệ tài chính cho doanh nghiệp Cross-Border E-commerce.

---

## ⏱️ PHÂN BỔ THỜI GIAN & PHÂN CẢNH

### 0:00 – 0:40 | Cảnh 1: Đặt Vấn Đề & Giới Thiệu Wealify Guardian
* **Hình ảnh:** Màn hình chuyển từ sự phức tạp của việc quản lý nhiều thẻ ảo, ví và sao kê ngân hàng sang Dashboard trực quan của Wealify Guardian.
* **Lời bình (Voiceover):**  
  *"Xin chào Ban Giám Khảo. Một doanh nghiệp kinh doanh xuyên biên giới trên Wealify mỗi tháng xử lý hàng trăm giao dịch: tiền chạy quảng cáo Meta Ads, doanh thu payout từ Amazon, Stripe, các gói SaaS và chi phí thẻ ảo. Tiền nằm rải rác ở nhiều nguồn, rất dễ bị quẹt trùng, chậm payout hoặc bị lừa đảo bởi biên lai giả mạo.*  
  *Hôm nay, chúng tôi mang tới **Wealify Guardian** — Trợ lý AI bảo vệ giao dịch & quản lý chi tiêu thế hệ mới, xây dựng trên nền tảng **Google Agent Development Kit (ADK)** và **Google Gemini** với nguyên tắc cốt lõi: **AI hiểu & điều phối — Công cụ tài chính tính toán — Bằng chứng chứng minh — Chính sách kiểm soát — Người dùng ra quyết định**."*

---

### 0:40 – 1:30 | Cảnh 2: Báo Cáo Chi Tiêu Đột Biến & Đối Soát 3 Nguồn (3-Way Reconciliation)
* **Thao tác trên màn hình:**
  1. Người dùng mở tab **AI Copilot**, gõ: *"Tháng này tôi chi bao nhiêu và có khoản nào bất thường không?"*
  2. Hệ thống hiển thị vết suy luận (Thought Chain): `[Guardrail Checked] ➔ [ADK Intent Planning] ➔ [Tool: generate_expense_report] ➔ [Grounding Reflection]`.
  3. Phản hồi Markdown dạng bảng số liệu, Top 3 khoản chi lớn nhất, phí ngân hàng và đính kèm dòng cảnh báo 60 ngày theo luật Mỹ Regulation E.
  4. Người dùng hỏi tiếp: *"Có tiền nào rời tài khoản ngân hàng nhưng chưa lên thẻ không?"*
  5. Hệ thống gọi `reconcile_3way_transactions` và trả về đúng quy chuẩn: *"Lệch $50.00 giữa Bank Account và Card Statement — chưa xác định nguyên nhân."*
* **Lời bình:**  
  *"Wealify Guardian không bao giờ đoán mò. Mọi con số đều được tính toán từ sổ cái thực và gắn mốc hạn 60 ngày theo luật định Mỹ."*

---

### 1:30 – 2:20 | Cảnh 3: Quét Quẹt Trùng Thẻ Ảo & Tự Động Sinh Đơn Tra Soát (Dispute Draft)
* **Thao tác trên màn hình:**
  1. Người dùng gõ: *"Có khoản nào bị tính 2 lần trên thẻ không?"*
  2. Hệ thống phát hiện ngay 2 giao dịch `$250.00` và `$150.00` cách nhau chỉ vài phút trên thẻ ảo Volcano Ads (`**** 0001`).
  3. Gắn nhãn chuẩn: `Cần bạn tự xác nhận`.
  4. Bấm nút **"Xuất Đơn Tra Soát (PDF)"** — Hệ thống sinh ngay một văn bản khiếu nại chuẩn ngân hàng quốc tế có mã ARN và điều khoản Regulation E để người dùng tự gửi.
* **Lời bình:**  
  *"Hệ thống tuân thủ 100% ranh giới Read-Only: Tuyệt đối không tự can thiệp tiền hay tự gửi email ra ngoài, mà soạn sẵn bản thảo hoàn hảo để chủ tài khoản toàn quyền quyết định."*

---

### 2:20 – 3:10 | Cảnh 4: Radar Payout Quá Hạn & Quản Lý Subscription Tăng Giá Ngầm
* **Thao tác trên màn hình:**
  1. Chuyển sang tab **Cảnh Báo (Alerts)**: Hiển thị cảnh báo Amazon Payout `$4,250.00` bị trễ 16 ngày (quá SLA 3 ngày) dù đã có email thông báo.
  2. Tab **Subscriptions**: Chỉ rõ gói phần mềm Paddle.net âm thầm tăng giá từ `$10.00` lên `$25.00/tháng`, dự báo tác động chi phí cả năm tăng thêm `$180.00/năm`.
* **Lời bình:**  
  *"Nhờ tính năng Radar dòng tiền, doanh nghiệp phát hiện ngay các khoản Payout bị kẹt trước khi rơi vào tình trạng thiếu hụt vốn lưu động."*

---

### 3:10 – 4:00 | Cảnh 5: Thẩm Định Biên Lai Giả Mạo Bằng Multimodal Vision (Anti-Scam)
* **Thao tác trên màn hình:**
  1. Kéo thả ảnh chụp màn hình chuyển khoản giả mạo (`$2,500.00`, mã `WF-839291`) vào khung kiểm tra.
  2. Gemini 2.0 Flash Vision bóc tách OCR, đối chiếu 5 chiều: Sổ cái ❌, Số dư ví ❌, Email ❌, Mã Ref ❌.
  3. Trả về **Điểm Xung Đột Bằng Chứng: 92/100 (Rất Nguy Hiểm)**, phân loại `Cần bạn tự xác nhận` và đưa ra cảnh báo dứt khoát: *"Không giao hàng trước khi tiền vào tài khoản."*
  4. Thử gõ lệnh: *"Chuyển $100 vào tài khoản Nam"* ➔ Hệ thống lập tức từ chối lịch sự theo chính sách Read-Only.
* **Lời bình:**  
  *"Tính năng Multimodal Vision bảo vệ nhà bán hàng tuyệt đối trước các chiêu trò làm giả ủy nhiệm chi tinh vi trên không gian mạng."*

---

### 4:00 – 4:30 | Cảnh 6: Tổng Kết & Giá Trị Mang Lại
* **Hình ảnh:** Toàn cảnh kiến trúc Google ADK và màn hình báo cáo hoàn tất.
* **Lời bình:**  
  *"Wealify Guardian — Minh bạch, An toàn, Dễ sử dụng, Bảo vệ từng đồng vốn cho doanh nghiệp số. Xin trân trọng cảm ơn Ban Giám Khảo!"*
