chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (isGoLink(tab)) {
        const key = parseKey(tab.url)
        chrome.tabs.update({url: "https://www.google.com?query=" + key});
    }
});


const isGoLink = (tab) => {
    if (!tab || !tab.url) return false

    const url = tab.url.toLowerCase()
    return url.startsWith('http://go/') || url.startsWith('https://go/')
}

const parseKey = (url) => {
    const pathname = new URL(url).pathname
    return pathname.split('/').pop()
}