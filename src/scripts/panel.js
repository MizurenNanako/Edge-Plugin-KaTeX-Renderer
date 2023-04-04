const buttons = document.getElementsByTagName('button');
for (const btn of buttons) {
    btn.onclick = function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    tabId: tabs[0].id,
                    action: btn.id
                },
                function (response) {
                    if (chrome.runtime.lastError.message === "Could not establish connection. Receiving end does not exist.")
                        alert("Cannot render / de-render tex in this page.");
                    window.close();
                }
            );
        });
    }
}