/**
 * Dịch vụ quản lý người dùng (User Service)
 * Phiên bản: v1.0.1 (Đã áp dụng bản vá Hotfix khẩn cấp)
 */

function getUserProfile(userId) {
    // Giả lập truy vấn thông tin tài khoản từ cơ sở dữ liệu
    const user = {
        id: userId,
        username: "nguyenvana",
        email: "vana@example.com",
        role: "customer",
        passwordHash: "raw_plain_password_secret_123456",
        creditCard: "4111-2222-3333-4444"
    };

    // ĐÃ VÁ LỖI BẢO MẬT (HOTFIX v1.0.1):
    // 1. Loại bỏ hoàn toàn trường passwordHash khỏi phản hồi client.
    // 2. Mã hóa/che giấu số thẻ tín dụng (chỉ giữ 4 số cuối để đối soát).
    const sanitizedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        maskedCreditCard: user.creditCard.replace(/\d{4}-\d{4}-\d{4}-(\d{4})/, "****-****-****-$1")
    };

    return sanitizedUser;
}

module.exports = { getUserProfile };
