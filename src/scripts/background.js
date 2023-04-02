chrome.contextMenus.create({
    "id": "KIR",
    "title": "KaTeX Instant Render",
    "contexts": ["page", "selection"],
});

function KIR(info, tab) {
    if (info.menuItemId == "KIR") {
        chrome.tabs.sendMessage(tab.id, { action: "KIR" });
    }
}

chrome.action.onClicked.addListener(function (tab) {
    // Do something here when the icon is clicked
    KIR({menuItemId: "KIR"}, tab);
});

// Add a listener for the context menu item click event
chrome.contextMenus.onClicked.addListener(KIR);