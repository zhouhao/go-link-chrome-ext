chrome.webRequest.onBeforeRequest.addListener(function (info) {
        console.log("url: " + info.url);
        return {redirectUrl: "https://www.google.com"};
    },
    // filters
    {
        urls: ["http://go/*", "https://go/*"],
        types: ["main_frame"]
    },
    // extraInfoSpec
    ["blocking"]
);