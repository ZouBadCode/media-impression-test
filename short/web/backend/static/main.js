document.addEventListener('DOMContentLoaded', function () {
    const arrow = document.querySelector('.arrow');
    const slideInElement = document.querySelector('.slide-in');

    function handleScroll() {
        // 檢查是否滑到 slideInElement
        const elementPosition = slideInElement.getBoundingClientRect().top;
        const screenPosition = window.innerHeight;

        if (elementPosition < screenPosition) {
            slideInElement.classList.add('active');
        } else {
            slideInElement.classList.remove('active');
        }

        // 根據滾動位置顯示或隱藏箭頭
        const scrollPosition = window.scrollY;
        if (scrollPosition >= slideInElement.offsetTop) {
            arrow.style.display = 'none';
        } else {
            arrow.style.display = 'block';
        }
    }

    window.addEventListener('scroll', handleScroll);

    // 箭頭點擊滾動到 slideInElement
    arrow.addEventListener('click', function () {
        window.scrollTo({
            top: slideInElement.offsetTop,
            behavior: 'smooth'
        });
    });
});

function to_analyze(){
    window.location.href = "/show-result"
}