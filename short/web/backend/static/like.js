document.addEventListener('DOMContentLoaded', function () {
    checkLikeStatus();

    document.getElementById('like-button').addEventListener('click', function () {
        let videoPlayer = document.getElementById('video-player');
        let videoName = getVideoTitleFromUrl(videoPlayer.src); // 從影片播放器獲取影片名稱
        let isLiked = this.classList.contains('liked');

        fetch(isLiked ? '/unlike' : '/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoName: videoName })
        }).then(() => {
            this.classList.toggle('liked', !isLiked);
        });
    });
});

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

function getVideoTitleFromUrl(url) {
    let parts = url.split('/');
    let filename = parts[parts.length - 1];
    return filename.split('.')[0]; // 移除檔案擴展名
}