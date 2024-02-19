const showAfterLogin = () => {
    $('#spinner').hide()
    $(".no-login").hide()
    $(".need-login").show()
}

const showBeforeLogin = () => {
    $('#spinner').hide()
    $(".no-login").show()
    $(".need-login").hide()
}

//---------------------------------
$('#spinner').show()
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
    getCurrentUrl((url) => {
        let urlKey = $("input#url-key").val().trim();
        if (urlKey.length === 0) {
            alert("Please enter a valid go link key")
            return
        }
        getToken((token) => {
            post(baseUrl + '/go_link', {link: url, key: urlKey}, token.access_token).then(response => {
                return response.json()
            }).then(data => {
                alert("data = " + JSON.stringify(data))
                success("Go link created successfully")
            }).catch(e => {
                // it can be error, but no block for server side processing, not sure why
                console.error('Error:' + e.message);
            }).finally(() => {
                fetchGoLinks(url)
            })
        })
    });
});

getToken((token) => {
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

getCurrentUrl((url) => {
    fetchGoLinks(url)
})
