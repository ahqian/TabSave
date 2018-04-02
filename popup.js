// Alex Qian

'use strict';

var tabList = document.getElementById("tabList");
var storedTabs = [];
var backConsole = console; //chrome.extension.getBackgroundPage().console;

function closeTab(tabId) {
    if (typeof tabId == "string") {
        tabId = parseInt(tabId);
    } else if (typeof tabId != "number") {
        backConsole.error("Improper tabId passed to closeTab: " + tabId);
        return;
    }

    chrome.tabs.remove(tabId, function() {
        //remove html tr here?
        
    });
}

function populateTabs(tabs) {
    backConsole.log("Refreshing tab list");

    tabList.innerHTML = "";

    for (var i = 0; i < tabs.length; i++) {
        var title = tabs[i].title;
        //backConsole.log("Tab: " + title + " id: " + tabs[i].id);

        var row = document.createElement("tr");

        //button which closes the tab
        var closeB = document.createElement("button");
        closeB.setAttribute("data-tab-id", tabs[i].id);
        closeB.setAttribute("class", "tabCloseButton");
        closeB.onclick = function() {
            var idToRemove = this.getAttribute("data-tab-id");
            closeTab(idToRemove);
            
            //TODO: remove row from callback
            //Remove row clicked on
            //-------------------td----------tr
            var trNode = this.parentNode.parentNode;
            trNode.parentNode.removeChild(trNode);
            backConsole.log("Removed row");
        };
        var td1 = document.createElement("td");
        td1.appendChild(closeB);
        
        //button which saves the tab
        var saveB = document.createElement("button");
        saveB.setAttribute("data-tab-title", tabs[i].title);
        saveB.setAttribute("data-tab-url", tabs[i].url);
        saveB.setAttribute("class", "tabSaveButton");
        saveB.onclick = function() {
            var tabTitle = this.getAttribute("data-tab-title");
            var tabUrl = this.getAttribute("data-tab-url");
            
            storedTabs.push({
                title: tabTitle,
                url: tabUrl
            });
            chrome.storage.sync.set({storedTabs: storedTabs}, function() {
                backConsole.log("Tab Saved");
            });
        };
        var td2 = document.createElement("td");
        td2.appendChild(saveB);

        var textNode = document.createTextNode(title);
        var td3 = document.createElement("td");
        td3.appendChild(textNode);

        row.appendChild(td1);
        row.appendChild(td2);
        row.appendChild(td3);

        tabList.appendChild(row);
    }
}

function populateStoredTabs(tabs) {
    storedTabs = tabs;
    tabList.innerHTML = "";
    
    for (var i = 0; i < tabs.length; i++) {
        var row = document.createElement("tr");
        
        //button which closes the tab
        var closeB = document.createElement("button");
        closeB.setAttribute("data-tab-url", tabs[i].url);
        closeB.setAttribute("class", "tabCloseButton");
        closeB.onclick = function() {
            var tabUrl = this.getAttribute("data-tab-url");
            //get index of tab in storage
            var pos = storedTabs.map(function(e) { return e.url; }).indexOf(tabUrl);
            
            if (pos > -1) {
                storedTabs.splice(pos, 1);
                chrome.storage.sync.set({storedTabs: storedTabs}, function() {
                    backConsole.log("Tab unsaved");
                });
            } else {
                backConsole.error("Attemped to unsave tab not found in storage");
            }
            
            //TODO: remove row from callback
            //Remove row clicked on
            //-------------------td----------tr
            var trNode = this.parentNode.parentNode;
            trNode.parentNode.removeChild(trNode);
            backConsole.log("Removed row");
        };
        var tdCloseButton = document.createElement("td");
        tdCloseButton.appendChild(closeB);
        
        var loadTabButton = document.createElement("button");
        loadTabButton.setAttribute("class", "tabLoadButton");
        loadTabButton.setAttribute("data-tab-url", tabs[i].url);
        loadTabButton.onclick = function() {
            chrome.tabs.create({url: this.getAttribute("data-tab-url"), active: false}, function() {
                backConsole.log("Restored tab.");
                //object context is different.
                //what object calls this?
                //backConsole.log("Restored tab: " + this.getAttribute("data-tab-title"));
            });
        };
        var tdLoadButton = document.createElement("td");
        tdLoadButton.appendChild(loadTabButton);
        
        var textNode = document.createTextNode(tabs[i].title);
        var tdTitle = document.createElement("td");
        tdTitle.appendChild(textNode);
        
        row.appendChild(tdCloseButton);
        row.appendChild(tdLoadButton);
        row.appendChild(tdTitle);
        
        tabList.appendChild(row);
    }
}

function setStoredTabs(result) {
    if (result.storedTabs != null) {
        backConsole.log("Retrieved tabs from storage.");
        populateStoredTabs(result.storedTabs);
    } else {
        backConsole.log("No tabs found in storage.")
    }
}

// SET UP BUTTONS

var refreshButton = document.getElementById('refreshButton');
refreshButton.onclick = function() {
    chrome.tabs.query({}, populateTabs);
};

var savedTabsButton = document.getElementById('savedTabsButton');
savedTabsButton.onclick = function() {
    chrome.storage.sync.get(['storedTabs'], setStoredTabs);
};

// Initial calls to populate fields
chrome.tabs.query({}, populateTabs);

