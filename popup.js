const baseUrl = 'http://localhost:8888'

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
    post(baseUrl + '/email-code', {email: email})
}

const login = (email, code) => {
    console.log("login21")
    post(baseUrl + '/login', {email: email, code: code}).then(response => {
        console.log("login")
        return response.json()
    }).then(data => {
        //TODO: cleanup
        console.log("token is " + JSON.stringify(data))
        storeToken(data)
    })
}

const storeToken = (token, callback) => {
    chrome.storage.local.set({token: token}, function () {
        console.log('Value is set');
        if (callback) callback()
    });
}

const getToken = (callback) => {
    chrome.storage.local.get(['token'], function (result) {
        console.log('Value currently is ' + JSON.stringify(result.token))
        if (callback) callback(result.token)
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

const isValidEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};
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
        // use `url` here inside the callback because it's asynchronous!
        alert(url)
    });
});

getToken((token) => {
    $('#spinner').hide()
    if (token) {
        if (isTokenExpired(token.access_token)) {
            $(".no-login").show()
            $(".need-login").hide()
        } else {
            $(".no-login").hide()
            $(".need-login").show()
        }
    } else {
        $(".no-login").show()
        $(".need-login").hide()
    }
})

