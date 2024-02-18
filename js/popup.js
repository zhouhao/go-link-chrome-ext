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

const showAfterLogin = () => {
    $(".no-login").hide()
    $(".need-login").show()
}

const showBeforeLogin = () => {
    $(".no-login").show()
    $(".need-login").hide()
}

//---------------------------------

$("#send-email-code").on("click", function () {
    let email = $("input#user-email").val().trim();
    if (!isValidEmail(email)) {
        alert(email + " is not a valid email address")
        return
    }

    requestEmailCode(email)
});

$("#login").on("click", function () {
    let email = $("input#user-email").val().trim();
    let emailCode = $("input#email-code").val().trim();
    if (!isValidEmail(email) || emailCode.length === 0) {
        alert("Please make sure email and code are valid")
        return
    }

    login(email, emailCode)
});

$("#create-new-link").on("click", function () {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url
        let urlKey = $("input#url-key").val().trim();

        if (urlKey.length === 0) {
            alert("Please enter a valid go link key")
            return
        }
        alert(url)
    });
});

getToken((token) => {
    $('#spinner').hide()
    // alert("token = " + JSON.stringify(token))
    if (token) {
        let isAccessExpired = isTokenExpired(token.access_token)
        if (!isAccessExpired || (isAccessExpired && !isTokenExpired(token.refresh_token))) {
            if (isAccessExpired) refreshToken(token)
            showAfterLogin()
            return
        }
    }
    showBeforeLogin()
})

