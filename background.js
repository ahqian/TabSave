'use strict';

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757'}, function() {
        console.log("TabShare started.");
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //console.log(sender.tab ?
    //            "from a content script:" + sender.tab.url :
    //            "from the extension");
    switch(request.message) {
        case "funcCall":
            switch(request.function) {
                case "closeTab":
                    closeTab(request.tabId);
                    sendResponse({message: "Tab " + request.tabId + " Closed"});
                    break;
                default:
                    console.log("ERROR: Unrecognized function");
                    break;
            }
            break;
        default:
            console.log("ERROR: Unrecognized message type");
            break;
    }
});


function closeTab(id) {
    console.log("Closing tab Id: " + id);
    chrome.tabs.remove(parseInt(id), function(){});
    console.log("Remove called");
}