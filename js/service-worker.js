const RESET_LOCAL_CACHE = "RESET_LOCAL_CACHE"
const isGoLink = (tab) => {
    if (!tab || !tab.url) return false

    const url = tab.url.toLowerCase()
    return url.startsWith('http://go/') || url.startsWith('https://go/')
}

const parseKey = (url) => {
    const pathname = new URL(url).pathname
    return pathname.split('/').pop()
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: 'Reset Go Link local cache',
        id: RESET_LOCAL_CACHE,
        contexts: ['all'],
    });
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === RESET_LOCAL_CACHE) {
        chrome.storage.local.clear(() => {
        });
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (isGoLink(tab)) {
        const key = parseKey(tab.url)
        chrome.tabs.update({url: "https://www.google.com?query=" + key});
    }
});

