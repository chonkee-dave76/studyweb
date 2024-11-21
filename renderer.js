document.addEventListener('DOMContentLoaded', () => {

    // Titlebar Controls
    const closeButton = document.getElementById("close-button")
    const minimiseButton = document.getElementById("minimise-button")
    const fullscreenButton = document.getElementById("fullscreen-button")

    minimiseButton.addEventListener('click', () => {
        window.electronAPI.minimize();
    });

    fullscreenButton.addEventListener('click', () => {
        window.electronAPI.toggleFullscreen();
    });

    closeButton.addEventListener('click', () => {
        window.electronAPI.close();
    });

    // Browser Controls
    const backButton = document.getElementById("back-button")
    const forwardButton = document.getElementById("forward-button")
    const refreshButton = document.getElementById("refresh-button")

    // Tabs Controls
    let tabs = [];
    let activeTab = null;

    const tabBar = document.getElementById("tab-column")
    const newTabButton = document.getElementById("new-tab-button")
    const webviewContainer = document.getElementById("webview-container")

    function createTab(url = 'https://www.google.com') {
        const tabId = `tab-${tabs.length + 1}`;
        const webviewId = `webview-${tabs.length + 1}`;
    
        // Create tab button
        const tabButton = document.createElement('button');
        tabButton.className = 'tab';
        tabButton.textContent = '';
        tabButton.dataset.tabId = tabId;
    
        // Create webview
        const webview = document.createElement('webview');
        webview.id = webviewId;
        webview.src = url;
        webview.style.display = 'none';
        webviewContainer.appendChild(webview);

        const faviconImg = document.createElement('img');
        faviconImg.className = 'tab-favicon';
        faviconImg.src = 'icons/default-favicon.svg'; // Default favicon
        tabButton.appendChild(faviconImg);

        const tabText = document.createElement('span');
        tabText.className = 'tab-text';
        tabText.textContent = 'New Tab';
        tabButton.appendChild(tabText);
        
        document.getElementById('tab-controls').appendChild(tabButton);
        document.getElementById('webview-container').appendChild(webview);

        webview.addEventListener('did-navigate', () => updateTabDetails(webview, tabButton));
        webview.addEventListener('did-finish-load', () => updateTabDetails(webview, tabButton));

        // Add to tab array
        tabs.push({
            id: tabId,
            button: tabButton,
            webview: webview,
        });
    
        // Append the tab button to the tab bar
        tabBar.append(tabButton);
    
        // Set the new tab as active
        setActiveTab(tabId);
    
        // Tab button click event
        tabButton.addEventListener('click', () => {
            setActiveTab(tabId);
        });
    }

    function updateTabDetails(webview, tabButton) {
        const tabText = tabButton.querySelector('.tab-text');
        const faviconImg = tabButton.querySelector('.tab-favicon');
    
        // Update tab text with the page title
        webview.executeJavaScript('document.title', true).then((title) => {
            tabText.textContent = title || 'New Tab';
        });
    
        // Update favicon
        const domain = webview.getURL();
        const rootDomain = new URL(domain).origin
        const rootFaviconUrl = `${rootDomain}/favicon.ico`;
        if (rootFaviconUrl) {
            faviconImg.src = rootFaviconUrl;
        } else {
            faviconImg.src = 'icons/default-favicon.svg'
        }
    }

    function setActiveTab(tabId) {
        // Hide all webviews and deactivate all tabs
        tabs.forEach((tab) => {
            tab.webview.style.display = 'none';
            tab.button.classList.remove('active');
        });
    
        // Find the active tab and show its webview
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) {
            tab.webview.style.display = 'flex';
            tab.button.classList.add('active');
            activeTab = tabId;
        }
    }

    newTabButton.addEventListener('click', () => {
        createTab();
    });

});