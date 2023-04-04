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
        chrome.tabs.sendMessage(
            tab.id,
            { action: info.menuItemId },
            function () {
                if (chrome.runtime.lastError.message === "Could not establish connection. Receiving end does not exist.") {
                    alert({ html: '<html><body style="background-color: rgba(255, 192, 203, 0.705);"><img src="/icons/icon128.png"/><h2>Error: KaTeX not avaliable on current page.</h2></body></html>' })
                    .then(() => console.log('Cannot render / de-render tex in this page.'));
                    
                }
            }
        );
    }
}

// chrome.action.onClicked.addListener(function (tab) {
// Do something here when the icon is clicked
// contextMenusHandler({ menuItemId: "KIR" }, tab);
// });

chrome.commands.onCommand.addListener(function (command, tab) {
    // console.log('Command:', command);
    contextMenusHandler({ menuItemId: command }, tab);
});

// Add a listener for the context menu item click event
chrome.contextMenus.onClicked.addListener(contextMenusHandler);

async function alert({
    html,
    title = chrome.runtime.getManifest().name,
    width = 300,
    height = 150,
    left,
    top,
}) {
    const w = left == null && top == null && await chrome.windows.getCurrent();
    const w2 = await chrome.windows.create({
        url: `data:text/html,<title>${title}</title>${html}`.replace(/#/g, '%23'),
        type: 'popup',
        left: left ?? Math.floor(w.left + (w.width - width) / 2),
        top: top ?? Math.floor(w.top + (w.height - height) / 2),
        height,
        width,
    });
    return new Promise(resolve => {
        chrome.windows.onRemoved.addListener(onRemoved, { windowTypes: ['popup'] });
        function onRemoved(id) {
            if (id === w2.id) {
                chrome.windows.onRemoved.removeListener(onRemoved);
                resolve();
            }
        }
    });
}