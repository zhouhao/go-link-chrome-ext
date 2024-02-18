$("#create-new-link").on("click", function () {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url
        // use `url` here inside the callback because it's asynchronous!
        alert(url)
    });
});

$(".no-login").show()

$(".need-login").show()

//----------------- Utils function -----------------

const post = (url, data) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
}

const get = (url) => {
    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

const storeToken = (token, callback) => {
    chrome.storage.local.set({token: token}, function () {
        console.log('Value is set');
        callback()
    });
}

const getToken = (callback) => {
    chrome.storage.local.get(['token'], function (result) {
        console.log('Value currently is ' + result.token);
        callback(result.token)
    });
}

const parseJwt = (token) => {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

const isTokenExpired = (token) => {
    const jwt = parseJwt(token)
    return jwt.exp < Date.now() / 1000
}

