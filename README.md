# BÁO CÁO THỰC HÀNH - BÀI 4
## CHỦ ĐỀ: MÔ PHỎNG QUY TRÌNH HOTFIX & GITFLOW THỰC TẾ

- **Môn học**: IT209 - Quản lý Phiên bản và Hợp tác Mã nguồn
- **Học viên**: Trần Trí Dũng (`duongtran1702`)
- **Email**: `duong170226@gmail.com`
- **Đường dẫn bài nộp trên GitHub**: `homework/session_05/ex4/`

---

## 1. MỤC TIÊU BÀI TẬP
1. Áp dụng thành thạo mô hình phân nhánh **Gitflow chuẩn** trong quản lý vòng đời phát triển phần mềm (SDLC).
2. Nắm vững kỹ năng ứng phó sự cố sản xuất: Khởi tạo, sửa đổi và tích hợp nhánh **Hotfix khẩn cấp** trực tiếp vào hệ thống đang vận hành (`main`).
3. Thực hiện đồng bộ hóa bản vá nóng ngược về nhánh phát triển (`develop`) nhằm loại trừ triệt để nguy cơ tái xuất hiện lỗi (**Bug Regression**) trong các phiên bản tương lai.
4. Làm chủ các thao tác gắn nhãn phiên bản (**Git Tag** Semantic Versioning) và đọc hiểu đồ thị phân nhánh commit trực quan (`git log --graph`).

---

## 2. BỐI CẢNH VÀ RÀNG BUỘC KỸ THUẬT

### 2.1. Bối cảnh bài toán thực tế
- Hệ thống đang chạy ổn định trên môi trường Production ở nhánh `main` (phiên bản đánh dấu `v1.0.0`).
- Bộ phận An ninh thông tin bất ngờ phát hiện lỗ hổng nghiêm trọng trong dịch vụ người dùng ([userService.js](userService.js)): hàm `getUserProfile` vô tình xuất toàn bộ mật khẩu nguyên bản (`passwordHash`) và số thẻ tín dụng (`creditCard`) ra phản hồi của client.
- Cùng thời điểm đó, đội ngũ phát triển đang phát triển dở dang tính năng đặt hàng mới ([featureOrder.js](featureOrder.js)) trên nhánh `develop` phục vụ cho phiên bản tương lai `v2.0.0`. Nhánh `develop` chứa mã nguồn chưa qua kiểm thử đầy đủ, **tuyệt đối không thể triển khai (deploy) ngay lên production**.

### 2.2. Ràng buộc thực hiện
1. **Tách nhánh khẩn cấp**: Tạo nhánh sửa lỗi `hotfix/v1.0.1` tách ra trực tiếp từ nhánh `main`.
2. **Triển khai bản vá lên Production**: Sau khi sửa xong trên nhánh hotfix, gộp ngay vào `main` và gắn tag phiên bản phát hành `v1.0.1`.
3. **Đồng bộ hóa về nhánh phát triển**: Bắt buộc phải gộp ngược lại nhánh `hotfix/v1.0.1` vào nhánh `develop` để đảm bảo các tính năng mới trong tương lai kế thừa bản sửa lỗi này.
4. **Dọn dẹp môi trường**: Xóa nhánh `hotfix/v1.0.1` cục bộ sau khi hoàn thành quy trình gộp.

---

## 3. TỔNG QUAN MÔ HÌNH PHÂN NHÁNH GITFLOW

Mô hình Gitflow do Vincent Driessen đề xuất gồm 2 nhánh vĩnh cửu (permanent branches) và 3 loại nhánh hỗ trợ tạm thời (supporting branches):

```text
                                  [v1.0.1]
   main ────────*────────────────────*───────── (Production Stable)
                 \                  / \
hotfix            \───* (hotfix) ──/   \
                       \                \
develop ──*─────────────*────────────────*───── (Active Development)
           \           /
feature     └───*─────/                         (New Features)
```

### Các nhánh trong Gitflow:
1. **Nhánh `main`**:
   - Chứa mã nguồn đã kiểm thử kỹ lưỡng, đại diện cho phiên bản chạy trên Production.
   - Mỗi commit trên `main` thường là kết quả của việc gộp từ `release/*` hoặc `hotfix/*`, và được đánh dấu phiên bản bằng `git tag` (ví dụ: `v1.0.0`, `v1.0.1`).
2. **Nhánh `develop`**:
   - Chứa mã nguồn mới nhất sẵn sàng cho lần release tiếp theo.
   - Là nhánh trung tâm nơi tất cả các tính năng (`feature/*`) đổ về.
3. **Nhánh `feature/*`**:
   - Tách ra từ `develop` để phát triển một chức năng độc lập, sau khi hoàn thành thì gộp lại vào `develop`.
4. **Nhánh `release/*`**:
   - Tách từ `develop` khi chuẩn bị phát hành phiên bản mới để đóng băng tính năng, chỉ sửa lỗi nhỏ và tài liệu.
5. **Nhánh `hotfix/*`**:
   - **Nhánh duy nhất được phép tách trực tiếp từ `main`** để khắc phục sự cố khẩn cấp trên Production mà không làm gián đoạn tiến độ của nhánh `develop`.
   - Sau khi hoàn thành, hotfix bắt buộc phải gộp vào **cả `main` lẫn `develop`**.

---

## 4. SƠ ĐỒ PHÂN NHÁNH MERGE VÀ ĐỒ THỊ COMMIT (ASCII DIAGRAM)

### 4.1. Sơ đồ luồng xử lý Hotfix v1.0.1

```text
                    (Lỗi bảo mật trên v1.0.0)
                               │
                       [hotfix/v1.0.1]
                       (Commit: f4a25ad)
                       Sửa mã nguồn:
                       - Ẩn password
                       - Mask credit card
                             /   \
       (Merge hotfix)       /     \       (Merge hotfix đồng bộ)
                           /       \
                          ▼         ▼
[main] ────────────────*───────► [main] (Commit d6e4995) ──► Tag: v1.0.1
(Commit 1d1bc8a)                                                  ▲
Tag: v1.0.0                                                       │
     │                                                     (Đã vá lỗi Prod)
     ▼
[develop] ─────────────*───────────────────────────────────► [develop] (Commit 067e562)
(Commit 1d1bc8a)   (Commit e368848:                               ▲
                    Đang phát triển dở                            │
                    tính năng order)                      (Đã đồng bộ bản vá)
```

---

### 4.2. Đồ thị Commit thực tế trích xuất từ Repository (`git log --graph --oneline --all --decorate`)

```text
*   48f790c (develop) docs(ex4): Dong bo bao cao README vao develop
|\  
| * 548c038 (HEAD -> main) docs(ex4): Bo sung bao cao README quy trinh Hotfix va Gitflow
| *   d6e4995 (tag: v1.0.1) Merge branch 'hotfix/v1.0.1' into main
| |\  
* | \   067e562 Merge branch 'hotfix/v1.0.1' into develop
|\ \ \  
| | |/  
| |/|   
| * | f4a25ad fix(security): Khac phuc lo du lieu nhay cam nguoi dung trong getUserProfile
| |/  
* / e368848 feat(ex4): Phat trien tinh nang order-service dang do cho phien ban tuong lai v2.0
|/  
* 1d1bc8a (tag: v1.0.0) feat(ex4): Khoi tao he thong user-service phien ban v1.0.0
* 7584c71 docs(ex1): Bo sung bao cao README khoi phuc commit bang git reflog
* c42f5f4 Them tinh nang quan trong
* 18ecfa0 chore: Khoi tao kho luu tru session 5
```

---

## 5. CÁC BƯỚC TRIỂN KHAI CHI TIẾT (KÈM LỆNH VÀ TERMINAL OUTPUT)

### Bước 1: Khởi tạo hệ thống v1.0.0 trên nhánh `main` và gắn tag `v1.0.0`
Tạo tệp `homework/session_05/ex4/userService.js` có chứa lỗi bảo mật lộ mật khẩu và thông tin thẻ.
Thực hiện commit và đánh dấu phiên bản stable ban đầu:

```bash
git checkout main
git add .
git commit -m "feat(ex4): Khoi tao he thong user-service phien ban v1.0.0"
git tag -a v1.0.0 -m "Release version 1.0.0"
```

**Ghi nhận Terminal**:
```text
[main 1d1bc8a] feat(ex4): Khoi tao he thong user-service phien ban v1.0.0
 2 files changed, 27 insertions(+)
 create mode 100644 homework/session_05/ex4/userService.js
```

---

### Bước 2: Tách nhánh `develop` và phát triển tính năng mới dở dang
Tách nhánh `develop` từ `main` để tiếp tục lộ trình phát triển:
```bash
git checkout -b develop
```
Tạo tệp `homework/session_05/ex4/featureOrder.js` giả lập tính năng đặt hàng v2.0 đang hoàn thiện dở dang:
```bash
git add .
git commit -m "feat(ex4): Phat trien tinh nang order-service dang do cho phien ban tuong lai v2.0"
```

**Ghi nhận Terminal**:
```text
[develop e368848] feat(ex4): Phat trien tinh nang order-service dang do cho phien ban tuong lai v2.0
 1 file changed, 20 insertions(+)
 create mode 100644 homework/session_05/ex4/featureOrder.js
```

---

### Bước 3: Phát hiện sự cố khẩn cấp trên Production - Tạo nhánh `hotfix/v1.0.1` từ `main`
Nhận được thông báo sự cố lộ dữ liệu trên bản chạy thật (`main`). Lập tức quay lại `main` và tách nhánh sửa lỗi khẩn cấp:
```bash
git checkout main
git checkout -b hotfix/v1.0.1
```

**Ghi nhận Terminal**:
```text
Switched to branch 'main'
Switched to a new branch 'hotfix/v1.0.1'
```

---

### Bước 4: Sửa lỗi bảo mật trên nhánh `hotfix/v1.0.1`
Chỉnh sửa tệp `userService.js` để làm sạch dữ liệu (sanitization):
- Xóa bỏ trường `passwordHash` khỏi kết quả trả về.
- Áp dụng mặt nạ cho số thẻ tín dụng (`maskedCreditCard`), chỉ hiển thị 4 số cuối: `****-****-****-4444`.

Tiến hành commit bản vá:
```bash
git add homework/session_05/ex4/userService.js
git commit -m "fix(security): Khac phuc lo du lieu nhay cam nguoi dung trong getUserProfile"
```

**Ghi nhận Terminal**:
```text
[hotfix/v1.0.1 f4a25ad] fix(security): Khac phuc lo du lieu nhay cam nguoi dung trong getUserProfile
 1 file changed, 13 insertions(+), 5 deletions(-)
```

---

### Bước 5: Gộp nhánh hotfix vào `main` và gắn tag phát hành `v1.0.1`
Chuyển về `main`, gộp nhánh bằng cờ `--no-ff` (No Fast-Forward) để tạo merge commit rõ ràng, sau đó đánh tag phiên bản `v1.0.1`:
```bash
git checkout main
git merge --no-ff hotfix/v1.0.1 -m "Merge branch 'hotfix/v1.0.1' into main"
git tag -a v1.0.1 -m "Release Hotfix 1.0.1"
```

**Ghi nhận Terminal**:
```text
Switched to branch 'main'
Merge made by the 'ort' strategy.
 homework/session_05/ex4/userService.js | 18 +++++++++++++-----
 1 file changed, 13 insertions(+), 5 deletions(-)
```
> Nhánh `main` đã có commit merge `d6e4995` và tag `v1.0.1`.

---

### Bước 6: Gộp ngược lại nhánh hotfix vào `develop` để đồng bộ bản vá
Chuyển sang nhánh `develop` và gộp bản vá hotfix vào để mã nguồn phát triển tương lai không bị sót lỗi:
```bash
git checkout develop
git merge --no-ff hotfix/v1.0.1 -m "Merge branch 'hotfix/v1.0.1' into develop"
```

**Ghi nhận Terminal**:
```text
Switched to branch 'develop'
Merge made by the 'ort' strategy.
 homework/session_05/ex4/userService.js | 18 +++++++++++++-----
 1 file changed, 13 insertions(+), 5 deletions(-)
```
> Nhánh `develop` đã được đồng bộ bản sửa lỗi thông qua commit merge `067e562` mà không làm mất tính năng `featureOrder.js` đang làm dở.

---

### Bước 7: Dọn dẹp nhánh hotfix cục bộ
Nhánh `hotfix/v1.0.1` đã hoàn thành sứ mệnh trên cả 2 nhánh chính, tiến hành xóa nhánh:
```bash
git branch -d hotfix/v1.0.1
```

**Ghi nhận Terminal**:
```text
Deleted branch hotfix/v1.0.1 (was f4a25ad).
```

---

## 6. KIỂM TRA VÀ XÁC THỰC KẾT QUẢ THEO YÊU CẦU

### 6.1. Kiểm tra danh sách nhánh (`git branch -a`)
```bash
git branch -a
```
**Output**:
```text
* develop
  main
```
> Nhánh tạm thời `hotfix/v1.0.1` đã được dọn dẹp sạch sẽ, chỉ còn lại 2 nhánh chính thức `develop` và `main`.

---

### 6.2. Kiểm tra danh sách Tag (`git tag`)
```bash
git tag
```
**Output**:
```text
v1.0.0
v1.0.1
```
> Đã có đầy đủ cả 2 tag phiên bản: `v1.0.0` (bản ban đầu) và `v1.0.1` (bản vá lỗi khẩn cấp).

---

### 6.3. Kiểm tra mã nguồn sau khi gộp trên cả hai nhánh

#### Trên nhánh `main`:
```javascript
// ĐÃ VÁ LỖI BẢO MẬT (HOTFIX v1.0.1):
const sanitizedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    maskedCreditCard: user.creditCard.replace(/\d{4}-\d{4}-\d{4}-(\d{4})/, "****-****-****-$1")
};
return sanitizedUser;
```

#### Trên nhánh `develop`:
Tệp `userService.js` có nội dung làm sạch hoàn toàn tương đồng với `main`, đồng thời tệp `featureOrder.js` vẫn được bảo toàn nguyên vẹn.

---

## 7. PHÂN TÍCH CHUYÊN SÂU: TẦM QUAN TRỌNG CỦA VIỆC ĐỒNG BỘ VỀ `DEVELOP`

### 7.1. Hiện tượng "Trôi lỗi" (Bug Regression) là gì?
Nếu sau khi sửa lỗi trên `hotfix/v1.0.1`, lập trình viên **chỉ gộp vào `main` mà quên gộp vào `develop`**:
1. Nhánh `main` (Production) tạm thời an toàn ở phiên bản `v1.0.1`.
2. Tuy nhiên, nhánh `develop` vẫn mang mã nguồn cũ chứa lỗi bảo mật.
3. Vài tuần sau, khi nhánh `develop` hoàn thiện tính năng và được release lên `main` thành phiên bản `v2.0.0`, **lỗi lộ mật khẩu cũ sẽ bị ghi đè trở lại vào Production**.
4. Đây chính là hiện tượng **Bug Regression** nguy hiểm bậc nhất trong quy trình phân nhánh mã nguồn nhóm lớn.

### 7.2. Tại sao nên dùng `--no-ff` khi gộp nhánh trong Gitflow?
- Khi merge một nhánh độc lập như hotfix hoặc feature, mặc định Git có thể thực hiện Fast-Forward (nếu nhánh đích chưa có commit mới).
- Sử dụng `--no-ff` (No Fast-Forward) ép buộc Git tạo một **Merge Commit** riêng biệt.
- **Lợi ích**:
  1. Giữ nguyên hình thái đồ thị (Topology) của nhánh, thể hiện rõ ràng khoảng thời gian nhánh hotfix tồn tại và thời điểm được gộp vào.
  2. Dễ dàng tra cứu hoặc `revert` toàn bộ nhánh nếu bản vá phát sinh vấn đề ngoài ý muốn.

---

## 8. KẾT LUẬN
Quy trình mô phỏng Gitflow Hotfix đã hoàn thành đạt chuẩn 100%:
- Nhánh `main` được cập nhật bản vá bảo mật và đánh dấu tag phát hành `v1.0.1`.
- Nhánh `develop` được đồng bộ bản vá ngay trong quá trình phát triển dở dang, đảm bảo tính liên tục và an toàn dữ liệu.
- Đồ thị commit thể hiện rõ ràng các giao điểm merge chuẩn mô hình Gitflow kinh điển.
