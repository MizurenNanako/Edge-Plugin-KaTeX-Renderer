chrome.contextMenus.create({
    "id": "KIR",
    "title": "Instant Render",
    "contexts": ["page", "selection"],
});

chrome.contextMenus.create({
    "id": "KFPR",
    "title": "Full Page Render",
    "contexts": ["page"],
});

chrome.contextMenus.create({
    "id": "KIDR",
    "title": "Instant De-Render",
    "contexts": ["page", "selection"],
});

chrome.contextMenus.create({
    "id": "KFPDR",
    "title": "Full Page De-Render",
    "contexts": ["page"],
});

chrome.contextMenus.create({
    "id": "KFR",
    "title": "Force Render",
    "contexts": ["selection"],
});

chrome.contextMenus.create({
    "id": "KSC",
    "title": "Syntax Check",
    "contexts": ["selection"],
});

function contextMenusHandler(info, tab) {
    if (["KIR", "KFPR", "KIDR", "KFPDR", "KFR", "KSC"].includes(info.menuItemId)) {
        chrome.tabs.sendMessage(tab.id, { action: info.menuItemId });
    }
}

chrome.action.onClicked.addListener(function (tab) {
    // Do something here when the icon is clicked
    contextMenusHandler({ menuItemId: "KIR" }, tab);
});

chrome.commands.onCommand.addListener(function (command, tab) {
    // console.log('Command:', command);
    contextMenusHandler({ menuItemId: command }, tab);
});

// Add a listener for the context menu item click event
chrome.contextMenus.onClicked.addListener(contextMenusHandler);
