document.addEventListener('DOMContentLoaded', () => {
    // Tab and active tab management
    let tabs = [];
    let activeTab = null;

    // DOM Elements
    const tabBar = document.getElementById('tab-bar');
    const webviewContainer = document.getElementById('webview-container');
    const newTabButton = document.getElementById('new-tab');
    const backButton = document.getElementById('back-button');
    const forwardButton = document.getElementById('forward-button');
    const urlInput = document.getElementById('url');
    const optionsButton = document.getElementById('options-button');
    const options = document.getElementById('options');
    const minimizeButton = document.getElementById('minimize');
    const fullscreenButton = document.getElementById('fullscreen');
    const closeButton = document.getElementById('close');

    // Create a new tab
    function createTab(url = 'https://www.google.com') {
        const tabId = `tab-${tabs.length + 1}`;
        const webviewId = `webview-${tabs.length + 1}`;

        // Create the tab button
        const tabButton = document.createElement('button');
        tabButton.className = 'tab';
        tabButton.textContent = `Tab ${tabs.length + 1}`;
        tabButton.dataset.tabId = tabId;

        // Create the webview
        const webview = document.createElement('webview');
        webview.id = webviewId;
        webview.src = url;
        webview.style.display = 'none';
        webview.style.flex = '1'; // Ensure webview fills its container

        // Close the options menu when a webview gains focus
        webview.addEventListener('focus', () => {
            options.style.display = 'none';
        });
        webviewContainer.appendChild(webview);

        // Add to tabs array
        tabs.push({
            id: tabId,
            button: tabButton,
            webview: webview,
        });

        // Append the tab button to the tab bar
        tabBar.insertBefore(tabButton, newTabButton);

        // Set the new tab as active
        setActiveTab(tabId);

        // Tab button click event
        tabButton.addEventListener('click', () => {
            setActiveTab(tabId);
        });
    }

    // Set active tab
    function setActiveTab(tabId) {
        // Hide all webviews and deactivate all tabs
        tabs.forEach((tab) => {
            tab.webview.style.display = 'none';
            tab.button.classList.remove('active');
        });

        // Show the selected webview and activate its tab
        const tab = tabs.find((t) => t.id === tabId);
        if (tab) {
            tab.webview.style.display = 'flex';
            tab.button.classList.add('active');
            activeTab = tabId;

            // Update the URL bar with the active tab's URL
            urlInput.value = tab.webview.src;
        }
    }

    // Navigation: Back
    backButton.addEventListener('click', () => {
        const activeWebview = tabs.find((t) => t.id === activeTab)?.webview;
        if (activeWebview && activeWebview.canGoBack()) {
            activeWebview.goBack();
        }
    });

    // Navigation: Forward
    forwardButton.addEventListener('click', () => {
        const activeWebview = tabs.find((t) => t.id === activeTab)?.webview;
        if (activeWebview && activeWebview.canGoForward()) {
            activeWebview.goForward();
        }
    });

    // Handle pressing "Enter" in the URL bar
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = urlInput.value.trim();
            const activeWebview = tabs.find((t) => t.id === activeTab)?.webview;
            if (activeWebview) {
                // Add protocol if missing
                activeWebview.src = url.includes('://') ? url : `https://${url}`;
            }
        }
    });

    //Open options menu
    optionsButton.addEventListener('click', () => {
        options.style.display = options.style.display === 'block' ? 'none' : 'block';
    })

    // Close the options menu if clicked outside of it
    document.addEventListener('click', (event) => {
        if (!options.contains(event.target) && !optionsButton.contains(event.target)) {
            options.style.display = 'none';
        }
    });

    // New Tab Button
    newTabButton.addEventListener('click', () => {
        createTab();
    });

    // Open the default tab
    createTab('https://www.google.com');

    minimizeButton.addEventListener('click', () => {
        window.electronAPI.minimize();
    });

    fullscreenButton.addEventListener('click', () => {
        window.electronAPI.toggleFullscreen();
    });

    closeButton.addEventListener('click', () => {
        window.electronAPI.close();
    });
});