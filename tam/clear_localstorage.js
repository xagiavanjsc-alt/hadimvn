// Clear localStorage data for admin panels
// Mở admin panel, paste vào console và Enter

// Xóa toàn bộ dữ liệu Melon
localStorage.removeItem('kts_melon_songs');
console.log('Đã xóa dữ liệu Melon songs');

// Xóa toàn bộ dữ liệu Naver KiN
localStorage.removeItem('kts_naver_kin_qa');
console.log('Đã xóa dữ liệu Naver KiN Q&A');

// Kiểm tra lại
console.log('Melon songs:', localStorage.getItem('kts_melon_songs'));
console.log('Naver KiN Q&A:', localStorage.getItem('kts_naver_kin_qa'));

// Reload để làm mới
location.reload();
