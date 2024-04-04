const textContainer = document.getElementById("text-container");
const cursorElement = document.querySelector(".cursor");
const text_1 = "影片觀看行為測驗";
const text_2 = "來和我一起研究影片吧";
let index = 0;
let isEnglish = true;  // 用於追踪當前是打英文還是中文

function typeText() {
    const currentText = isEnglish ? text_1 : text_2;  // 根據isEnglish選擇文字
    if (index < currentText.length) {
        textContainer.innerHTML += currentText.charAt(index);
        index++;

        const speed = isEnglish ? 100 : 200;  // 如果是英文，速度為100毫秒；如果是中文，速度為200毫秒
        setTimeout(typeText, speed);
    } else {
        setTimeout(clearText, 2000);  // 等待2秒後清空文字
    }
}

function clearText() {
    textContainer.innerHTML = "";  // 將標題內容設置為空
    index = 0;  // 重置索引
    isEnglish = !isEnglish;  // 切換語言
    setTimeout(typeText, 500);  // 等待半秒後重新開始打字
}

typeText();  // 啟動打字效果