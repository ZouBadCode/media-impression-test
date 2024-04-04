let lastActionTime = new Date().getTime();
let videoPlayer = document.getElementById('video-player');
let canScroll = true; // 新增一個變量來控制是否可以滾動

document.addEventListener('wheel', function (event) {
    // 如果 canScroll 為 false，則不處理這個滾輪事件
    if (!canScroll) {
        return;
    }

    let currentTime = videoPlayer.currentTime;
    let actionType = event.deltaY > 0 ? 'scrollDown' : 'scrollUp';
    let now = new Date().getTime();
    let duration = (now - lastActionTime) / 1000;  // 轉換為秒
    let videoTitle = getVideoTitleFromUrl(videoPlayer.src);  // 獲取當前播放的影片名稱

    lastActionTime = now;

    let data = {
        actionType: actionType,
        videoTime: currentTime,
        duration: duration,
        videoTitle: videoTitle
    };

    // 禁用滾輪事件，直到 1600 毫秒後
    canScroll = false;
    setTimeout(function () {
        canScroll = true; // 1600 毫秒後重新啟用滾輪事件
    }, 1600);

    // 發送數據到後端
    fetch('/record-action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
});

function getVideoTitleFromUrl(url) {
    // 從影片 URL 中提取影片名稱
    // 這裡假設 URL 的格式是 "/static/videos/影片名稱.mp4"
    let parts = url.split('/');
    let filename = parts[parts.length - 1];
    return filename.split('.')[0];  // 移除檔案擴展名
}


let lastTime1 = 0;  // 用於記錄上一次的播放時間
let lastTime2 = 0;  // 用於記錄上一次的播放時間
let lastTime3 = 0;  // 用於記錄上一次的播放時間
document.getElementById('video-player');
setInterval(function () {
    lastTime1 = videoPlayer.currentTime;
}, 750);
setInterval(function () {
    lastTime2 = videoPlayer.currentTime;
}, 500);
setInterval(function () {
    lastTime3 = videoPlayer.currentTime;
}, 250);



document.getElementById('video-player').addEventListener('seeked', function () {
    let currentTime = this.currentTime;  // 獲取新的播放時間
    let videoTitle = getVideoTitleFromUrl(this.src);  // 獲取影片名稱

    let data = {
        actionType: 'seeked',
        previousTime1: lastTime1,  // 之前的播放時間
        previousTime2: lastTime2,  // 之前的播放時間
        previousTime3: lastTime3,  // 之前的播放時間
        newTime: currentTime,    // 新的播放時間
        videoTitle: videoTitle
    };

    // 發送數據到後端
    fetch('/record-action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    lastTime = currentTime;  // 更新 lastTime 為新的播放時間
});