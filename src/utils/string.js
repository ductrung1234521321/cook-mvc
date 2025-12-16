/**
 * Chuyển đổi chuỗi thành dạng chuẩn hóa: chữ thường, không dấu, bỏ khoảng trắng thừa.
 * Mục đích: Dùng để so sánh, tìm kiếm hoặc tạo khóa duy nhất (unique key).
 * * Ví dụ: 
 * - "Thịt Bò" -> "thit bo"
 * - "  Gà    Nướng  " -> "ga nuong"
 * - "Đậu hũ" -> "dau hu"
 * * @param {string} str - Chuỗi cần chuẩn hóa
 * @returns {string} - Chuỗi đã chuẩn hóa
 */
export function normalizeText(str) {
    if (!str) return "";
    
    return str
        .toLowerCase() // Chuyển thành chữ thường
        .normalize("NFD") // Tách dấu ra khỏi ký tự gốc (ví dụ: é -> e + sắc)
        .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu (combining diacritical marks)
        .replace(/đ/g, "d") // Chuyển đ -> d (vì NFD không tách được chữ đ)
        .replace(/\s+/g, " ") // Thay thế nhiều khoảng trắng liên tiếp bằng 1 khoảng trắng
        .trim(); // Xóa khoảng trắng ở đầu và cuối
}