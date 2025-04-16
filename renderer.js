document.addEventListener('DOMContentLoaded', () => {
const apiKey = window.electronAPI.OPENAI_API_KEY;

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

    //Search Bar
    
    const searchBar = document.getElementById("search-bar-input");
    const searchButton = document.getElementById("search-button");

    searchBar.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchButton.click();
            searchBar.blur(); 
        }
    });

    searchButton.addEventListener('click', () => {
        const url = searchBar.value;
        if (tabs.length < 1 ) {
            if (url.startsWith('http://') || url.startsWith('https://')) 
                {
                    createTab(url);
                } else if (url.startsWith('www.')) {
                    createTab(`https://${url}`);
                } else if (url.includes('.')) {
                   createTab(`https://${url}`);
                }
                else {
                    createTab(`https://google.com/search?q=${encodeURIComponent(url)}`);
                }
        }
        else {
            if (url.startsWith('http://') || url.startsWith('https://')) 
            {
                changeWebviewToSearch(url);
            } else if (url.startsWith('www.')) {
                changeWebviewToSearch(`https://${url}`);
            } else if (url.includes('.')) {
               changeWebviewToSearch(`https://${url}`);
            }
            else {
                changeWebviewToSearch(`https://google.com/search?q=${encodeURIComponent(url)}`);
            }
        }
    });

    function changeWebviewToSearch(url) {
        const activeWebview = tabs[tabs.findIndex(tab => tab.id === activeTab)].webview
        if (activeWebview) {
            activeWebview.src = url;
        }
    }

    // Tabs Controls
    let tabs = [];
    let activeTab = null;

    const tabBar = document.getElementById("tab-column")
    const newTabButton = document.getElementById("new-tab-button")
    const webviewContainer = document.getElementById("webview-container")

    async function checkURL(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'no-cors', // Set to 'no-cors' for more lenient cross-origin requests
            });
    
            if (response.ok) {
                return true;  
            } else {
                return false;
            }
        } catch (error) {
            console.log("Error: Network issue or the URL does not exist.", error);
            return false; // Return false if there is a network error or URL doesn't exist
        }
    }

    async function createTab(url) {
        console.log(url)
        const isValidURL = await checkURL(url);

        if (url === undefined) {
            url = 'https://www.google.com';
        }
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
        faviconImg.src = 'icons/blank.svg'; // Default favicon
        tabButton.appendChild(faviconImg);

        const tabText = document.createElement('span');
        tabText.className = 'tab-text';
        tabButton.appendChild(tabText);

        const closeTabButton = document.createElement('button');
        closeTabButton.className = 'close-tab-button';

        const img = document.createElement('img');
        img.src = 'icons/cross.svg';      

        // Append the image to the button
        closeTabButton.appendChild(img);

        tabButton.appendChild(closeTabButton);
        
        if (isValidURL || url === 'https://www.google.com') {
            document.getElementById('tab-controls').appendChild(tabButton);
            document.getElementById('webview-container').appendChild(webview);

            webview.addEventListener('did-navigate', () => updateTabDetails(webview, tabButton));
            webview.addEventListener('did-finish-load', () => updateTabDetails(webview, tabButton));
            webview.addEventListener('load-commit', () => updateTabDetails(webview, tabButton));
        }
    
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
            searchBar.value = webview.src;
        });

        closeTabButton.addEventListener('click', () => {
            event.stopPropagation(); // Prevent triggering the tab activation
            deleteTab(tabId);
        });

        if (tabs.length === 1) {
            hideDefaultPage();
        }

        if (!isValidURL && url !== 'https://www.google.com') {
            tabButton.querySelector('.tab-favicon').src = 'icons/error-page.svg';
            tabButton.querySelector('.tab-text').textContent = 'Error';
            webview-window.electronAPI.getAppPath().then(appPath => {
                const resolvedPath = `${appPath}/error-occured.html`;  // Resolve path
                webview.src = `file://${resolvedPath}`;  // Set the src to the local file
            });
        }
    }
    
    function updateTabDetails(webview, tabButton) {
        const tabText = tabButton.querySelector('.tab-text');
        const faviconImg = tabButton.querySelector('.tab-favicon');
        
        
        searchBar.value = webview.src;

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

        tab.webview.addEventListener('dom-ready', () => {
            console.log(`WebView for Tab ${tabId} is ready.`);
            updateNavigationButtons(); // Update navigation buttons when the webview is ready
        });
    }

    function deleteTab(tabId) {
        // Find the index of the tab to delete
        const tabIndex = tabs.findIndex(tab => tab.id === tabId);
        if (tabIndex === -1) return; // If tab not found, exit
    
        const tab = tabs[tabIndex];
    
        // Remove the tab's button and webview from the DOM
        tab.button.remove();
        tab.webview.remove();
    
        // Remove the tab from the tabs array
        tabs.splice(tabIndex, 1);
    
        // If the deleted tab was active, set the last tab as active
        if (activeTab === tabId && tabs.length > 0) {
            const lastTab = tabs[tabs.length - 1];
            setActiveTab(lastTab.id);
        } else if (tabs.length === 0) {
            searchBar.value = '';
            activeTab = null; // No tabs left
            // Show the default HTML file in the webview-container
            showDefaultPage();
            refreshButton.disabled = true
        }
    }

    // Browser Controls
    const backButton = document.getElementById("back-button")
    const forwardButton = document.getElementById("forward-button")
    const refreshButton = document.getElementById("refresh-button")
    backButton.disabled = true;
    forwardButton.disabled = true;
    refreshButton.disabled = true;

    backButton.addEventListener('click', () => {
        const activeWebview = tabs[tabs.findIndex(tab => tab.id === activeTab)].webview
        if (activeWebview && activeWebview.canGoBack()) {
            activeWebview.goBack();
        }
        updateNavigationButtons();
    });

    forwardButton.addEventListener('click', () => {
        const activeWebview = tabs[tabs.findIndex(tab => tab.id === activeTab)].webview
        if (activeWebview && activeWebview.canGoForward()) {
            activeWebview.goForward();
        }
        updateNavigationButtons();
    });

    refreshButton.addEventListener('click', () => {
        const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (tabIndex !== -1) {
            ((tabs[tabIndex]).webview).reload()
        } else {
            // Do nothing
        }
    });

    function updateNavigationButtons() {
        const activeWebview = tabs[tabs.findIndex(tab => tab.id === activeTab)].webview

        if (activeWebview) {
            backButton.disabled = !activeWebview.canGoBack();
            forwardButton.disabled = !activeWebview.canGoForward();
            refreshButton.disabled = false
        } else {
            backButton.disabled = true;
            forwardButton.disabled = true;
        }
    }

    // Sidebar Controls

    const AiSummaryButton = document.getElementById("summarise-button")
    const AiSummaryPopup = document.getElementById("summary-popup")
    const CloseSummaryButton = document.getElementById("close-summary-button")
    
    const TOP_PADDING = 13;
    const BOTTOM_PADDING = 45; 

    function positionPopup(popup, button) {
        popup.style.left = "-9999px"; // Move off-screen to calculate width
        popup.style.display = "block";
    
        const buttonRect = button.getBoundingClientRect();
        
        popup.style.top = `${TOP_PADDING}px`; // Set custom top gap
        popup.style.left = `${window.scrollX + buttonRect.left - popup.clientWidth - 10}px`;
    
        // Subtract different top & bottom padding values
        popup.style.height = `${window.innerHeight - TOP_PADDING - BOTTOM_PADDING}px`;
    }

    AiSummaryButton.addEventListener('click', () => {
        if (AiSummaryPopup.classList.contains('show')) {
            AiSummaryPopup.classList.remove('show'); // Hide popup
            AiSummaryPopup.style.display = "none";
        } else {
            if (CitationPopup.classList.contains('show')) {
                CitationPopup.classList.remove('show'); // Hide popup
                CitationPopup.style.display = "none";
            }
            positionPopup(AiSummaryPopup, AiSummaryButton); // Position only when opening
            AiSummaryPopup.classList.add('show'); // Show popup
        }
    });

    const SummariseContentButton = document.getElementById("generate-summary-button")
    const SummaryTextContainer = document.getElementById("summary-text-container")

    function getActiveTabWebview() {
        const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (activeTabIndex !== -1) {
            return tabs[activeTabIndex].webview;
        }
        return null;
    }

    SummariseContentButton.addEventListener('click', async () => {

        const activeWebview = getActiveTabWebview();

        // Get HTML content from the webview
        const htmlContent = await activeWebview.executeJavaScript('document.documentElement.outerHTML');

        const summary = await window.electronAPI.summariseWebpage(htmlContent);
        console.log("Summary:", summary);
        document.getElementById('summaryOutput').innerText = summary;
    });

    CloseSummaryButton.addEventListener('click', () => {
        AiSummaryPopup.classList.remove('show'); // Hide the popup
        AiSummaryPopup.style.display = "none";
    });

    const CitationPopup = document.getElementById("citation-popup")
    const CitationButton = document.getElementById("citation-button")
    const CloseCitationButton = document.getElementById("close-citation-button")

    CitationButton.addEventListener('click', () => {
        if (CitationPopup.classList.contains('show')) {
            CitationPopup.classList.remove('show'); // Hide popup
            CitationPopup.style.display = "none";
        } else {
            if (AiSummaryPopup.classList.contains('show')) {
                AiSummaryPopup.classList.remove('show'); // Hide popup
                AiSummaryPopup.style.display = "none";
            }
            positionPopup(CitationPopup, CitationButton); // Position only when opening
            CitationPopup.classList.add('show'); // Show popup
        }
    });

    CloseCitationButton.addEventListener('click', () => {
        CitationPopup.classList.remove('show'); // Hide the popup
        CitationPopup.style.display = "none";
    });

    let projects = [];
    let activeProject = null;

    const projectColumn = document.getElementById("citation-text-container")
    const newProjectButton = document.getElementById("new-project-button")

    function createNewProject() {

        const projectId = `project-${projects.length + 1}`;

        // Create project button
        const projectButton = document.createElement('button');
        projectButton.className = 'project';
        projectButton.dataset.projectId = projectId;

        const projectButtonHeader = document.createElement('div');
        projectButtonHeader.className = 'project-header';

        //Create project title
        const projectTitle = document.createElement('span');
        projectTitle.className = 'project-title';
        projectTitle.contentEditable = 'true';
        projectTitle.textContent = 'New Project'; 

        projectButtonHeader.appendChild(projectTitle);

        const projectClickable = document.createElement('button');
        projectClickable.className = 'project-clickable';

        projectButtonHeader.appendChild(projectClickable);

        //Create add button
        
        const addProjectButton = document.createElement('button');
        addProjectButton.className = 'project-add-button';

        const addImg = document.createElement('img');
        addImg.src = 'icons/plus.svg';

        addProjectButton.appendChild(addImg);

        projectButtonHeader.appendChild(addProjectButton);

        //Create edit button

        const editProjectButton = document.createElement('button');
        editProjectButton.className = 'project-edit-button';

        const editImg = document.createElement('img');
        editImg.src = 'icons/edit-project.svg'; 

        editProjectButton.appendChild(editImg);

        projectButtonHeader.appendChild(editProjectButton);

        //Create delete button

        const deleteProjectButton = document.createElement('button');
        deleteProjectButton.className = 'project-delete-button';

        const deleteImg = document.createElement('img');
        deleteImg.src = 'icons/cross.svg';

        deleteProjectButton.appendChild(deleteImg);

        projectButtonHeader.appendChild(deleteProjectButton);

        projectButton.appendChild(projectButtonHeader);

        // Create expandable details container
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'project-citations';
        detailsContainer.style.display = 'none'; // Initially hidden

        // Sample list of spans (these could be task items, for example)
        const taskList = ['Task 1', 'Task 2', 'Task 3'];
        taskList.forEach(task => {
            const taskSpan = document.createElement('span');
            taskSpan.className = 'citation';
            taskSpan.textContent = task;
            detailsContainer.appendChild(taskSpan);
        });

        projectButton.append(detailsContainer); 

        // Add to project array
        projects.push({
            id: projectId,
            button: projectButton,
            citations: []
        });

        projectColumn.append(projectButton);

        setTimeout(() => {
            projectTitle.focus();
    
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(projectTitle);
            selection.removeAllRanges();
            selection.addRange(range);
        }, 0);
    
        
        // When user presses Enter or clicks away, lock the title
        projectTitle.addEventListener('blur', () => {
            projectTitle.contentEditable = 'false';
        });

        projectTitle.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent new line
                projectTitle.blur(); // Remove focus, triggering blur event
            }
        });

        // Edit button click makes title editable again
        editProjectButton.addEventListener('click', () => {
            projectTitle.contentEditable = 'true';
            projectTitle.focus();

            // Highlight text again when editing starts
            setTimeout(() => {
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(projectTitle);
                selection.removeAllRanges();
                selection.addRange(range);
            }, 0);
        });

        // Toggle details when clicking the project button
        projectTitle.addEventListener('click', () => {
        
        projectClickable.style.display = 'flex';
        addProjectButton.style.display = 'flex'; 
        editProjectButton.style.display = 'flex';
        deleteProjectButton.style.display = 'flex';
        
        // Toggle visibility of the details container
        detailsContainer.style.display = detailsContainer.style.display === 'none' ? 'flex' : 'none';
    });
    }

    newProjectButton.addEventListener('click', () => {
        createNewProject();
    });
    
    function updatePopupPosition() {
        if (AiSummaryPopup.classList.contains("show")) {
            positionPopup(AiSummaryPopup, AiSummaryButton);
        }
        else if (CitationPopup.classList.contains("show")) {
            positionPopup(CitationPopup, CitationButton);
        }
    }
    
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition);

    // Function to show the default page

    function showDefaultPage() {
        const dWebview = document.createElement('webview');
        dWebview.id = 'default-webview'
        webviewContainer.appendChild(dWebview);
        dWebview-window.electronAPI.getAppPath().then(appPath => {
            const resolvedPath = `${appPath}/default.html`;  // Resolve path
            dWebview.src = `file://${resolvedPath}`;  // Set the src to the local file
        });
    }

    function hideDefaultPage() {
        const dWebview = document.getElementById('default-webview');
        dWebview.remove();
    }

    if (tabs.length === 0) {
        showDefaultPage();
    }
    
    newTabButton.addEventListener('click', () => {
        createTab();
    });

});