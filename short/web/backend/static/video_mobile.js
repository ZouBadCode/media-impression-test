let touchStartY = 0;
let touchEndY = 0;
let isAnimating = false;
document.addEventListener('DOMContentLoaded', function () {
    fetchVideo('next'); // 在頁面加載時自動請求下一個影片
    fetchVideo('previous');
});

document.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
}, false);

document.addEventListener('touchmove', function (e) {
    touchEndY = e.touches[0].clientY;
    handleSwipe();
}, false);

function handleSwipe() {
    if (isAnimating) return;
    let videoPlayer = document.getElementById('video-player');
    if (touchEndY < touchStartY) { // 向上滑
        swipeAction('next', 'slide-up-out', 'slide-up-in');
    }
    if (touchEndY > touchStartY) { // 向下滑
        swipeAction('previous', 'slide-down-out', 'slide-down-in');
    }
}

function swipeAction(direction, slideOutClass, slideInClass) {
    isAnimating = true;
    videoPlayer.classList.add(slideOutClass);
    fadeOutText()
    setTimeout(() => {
        fetchVideo(direction);
        videoPlayer.classList.remove(slideOutClass);
        videoPlayer.classList.add(slideInClass);
        setTimeout(() => {
            videoPlayer.classList.remove(slideInClass);
            isAnimating = false;
        }, 800);
    }, 800);
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
            fadeInText()
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