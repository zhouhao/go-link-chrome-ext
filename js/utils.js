const baseUrl = 'http://localhost:8888'

const success = (message) => {
    $.notify(message, "success")
}
const warn = (message) => {
    $.notify(message, "warn")
}
const error = (message) => {
    $.notify(message, "error")
}
const info = (message) => {
    $.notify(message, "info")
}
const storeToken = (token, callback) => {
    chrome.storage.local.set({token: token}, function () {
        console.log('Value is set');
        if (callback) callback()
    });
}

const getToken = (callback) => {
    chrome.storage.local.get(['token'], function (result) {
        // todo: cleanup
        console.log('Value currently is ' + JSON.stringify(result.token))
        if (callback) callback(result.token)
    });
}
const post = (url, data, accessToken = '') => {
    return fetch(url, {
        method: 'POST',
        referrerPolicy: 'no-referrer',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': accessToken
        },
        body: JSON.stringify(data),
    })
}

const get = (url, accessToken = '') => {
    return fetch(url, {
        method: 'GET',
        referrerPolicy: 'no-referrer',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': accessToken
        },
    })
}

const requestEmailCode = (email) => {
    post(baseUrl + '/email_code', {email: email})
}

const login = (email, code) => {
    console.log("login21")
    post(baseUrl + '/login', {email: email, code: code}).then(response => {
        return response.json()
    }).then(data => {
        //TODO: cleanup
        console.log("token is " + JSON.stringify(data))
        storeToken(data, () => {
            showAfterLogin()
        })
    }).catch(error => {
        console.error('Error:', error);
    })
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

const isValidEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const refreshToken = (token) => {
    post(baseUrl + '/refresh_token', token).then(response => {
        return response.json()
    }).then(data => {
        storeToken(data)
    })
}

const renderGoLinks = (goLinks) => {
    const list = $("#go-links")
    list.empty()
    if(goLinks.length === 0) {
        list.append("<li>No go links found</li>")
        return
    }
    for (let i = 0; i < goLinks.length; i++) {
        let link = goLinks[i]
        list.append("<li><a href='" + link.link + "' target='_blank'> https://go/" + link.key + "</a></li>")
    }
}
const fetchGoLinks = (url) => {
    getToken((token) => {
        post(baseUrl + '/go_links', {link: url}, token.access_token).then(response => {
            return response.json()
        }).then(data => {
            renderGoLinks(data)
        })
    })
}

const getCurrentUrl = (callback) => {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url
        callback(url)
    });
}
