document.getElementById('short').addEventListener('click', function () {
    var userAgent = navigator.userAgent;
    // 使用正則表達式來檢查是否為手機用戶
    if (/mobile/i.test(userAgent)) {
        // 如果是手機用戶，重定向到手機版網頁
        window.location.href = '/video_mobile';
    } else {
        // 如果是電腦用戶，重定向到電腦版網頁
        window.location.href = '/video';
    }
})

document.getElementById('thumbnail-button').addEventListener('click', function () {
    var userAgent = navigator.userAgent;
    // 使用正則表達式來檢查是否為手機用戶
    if (/mobile/i.test(userAgent)) {
        // 如果是手機用戶，重定向到手機版網頁
        window.location.href = '/thumbnail';
    } else {
        // 如果是電腦用戶，重定向到電腦版網頁
        window.location.href = '/thumbnail';
    }
})


