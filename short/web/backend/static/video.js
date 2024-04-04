document.addEventListener('wheel', handleScroll);
let isAnimating = false;


document.addEventListener('DOMContentLoaded', function () {
    fetchVideo('next'); // 在頁面加載時自動請求下一個影片
    fetchVideo('previous');
    //詭異
});


function handleScroll(event) {
    if (isAnimating) return;  // 如果動畫正在進行，則不處理滾動事件
    let videoPlayer = document.getElementById('video-player');
    if (event.deltaY < 0) {  // 滾輪向上
        isAnimating = true; // 設置動畫標誌為 true
        videoPlayer.classList.add('slide-down-out');
        fadeOutText()
        setTimeout(() => {
            fetchVideo('previous');  // 切換到上一部影片
            videoPlayer.classList.remove('slide-down-out');
            videoPlayer.classList.add('slide-down-in');
            setTimeout(() => {
                videoPlayer.classList.remove('slide-down-in');
                isAnimating = false; // 重置動畫標誌為 false
            }, 800);
        }, 800);  // 等待動畫完成
    } else if (event.deltaY > 0) {  // 滾輪向下
        isAnimating = true; // 設置動畫標誌為 true
        videoPlayer.classList.add('slide-up-out');
        fadeOutText()
        setTimeout(() => {
            fetchVideo('next');  // 切換到下一部影片
            videoPlayer.classList.remove('slide-up-out');
            videoPlayer.classList.add('slide-up-in');
            setTimeout(() => {
                videoPlayer.classList.remove('slide-up-in');
                isAnimating = false; // 重置動畫標誌為 false
            }, 800); // 这里的 1000 应与 slide-up-in 动画的持续时间相匹配
        }, 800);  // 等待動畫完成

    }
}

function fetchVideo(direction) {
    fetch(`/get-video?direction=${direction}`)
        .then(response => response.json())
        .then(data => {
            let videoPlayer = document.getElementById('video-player');
            videoPlayer.src = data.videoUrl;
            videoPlayer.play();

            // 更新影片名稱
            let videoTitle = getVideoTitleFromUrl(data.videoUrl);
            document.getElementById('video-title').innerText = videoTitle;
            fadeInText();
            setupVideoReplay();
            checkLikeStatus();
        });
}


function getVideoTitleFromUrl(url) {
    // 從影片 URL 中提取影片名稱
    // 這裡假設 URL 的格式是 "/static/videos/影片名稱.mp4"
    let parts = url.split('/');
    let filename = parts[parts.length - 1];
    return filename.split('.')[0];  // 移除檔案擴展名

}

function setupVideoReplay() {
    let videoPlayer = document.getElementById('video-player');
    videoPlayer.addEventListener('ended', function () {
        this.currentTime = 0;  // 重置影片時間
        this.play();  // 重新播放影片
    });
}

function checkLikeStatus() {
    let videoPlayer = document.getElementById('video-player');
    let videoName = getVideoTitleFromUrl(videoPlayer.src); // 從影片播放器獲取影片名稱
    fetch(`/check-like?videoName=${videoName}`)
        .then(response => response.json())
        .then(data => {
            if (data.isLiked) {
                document.getElementById('like-button').classList.add('liked');
            } else {
                document.getElementById('like-button').classList.remove('liked');
            }

        });
}


function fadeOutText() {
    document.getElementById("video-title").classList.add("fade");
}
function fadeInText() {
    var textElement = document.getElementById('video-title');
    textElement.classList.remove('fade');
}