const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        frame: false,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            webviewTag: true,
            preload: `${__dirname}/preload.js`, // Add preload.js for IPC
        },
    });

    // Load the browser UI (browser.html)
    mainWindow.loadFile('index.html');
    
    ipcMain.on('window-minimize', () => {
        mainWindow.minimize();
    });

    ipcMain.on('window-toggle-fullscreen', () => {
        if (mainWindow.isFullScreen()) {
            mainWindow.setFullScreen(false);
        } else {
            mainWindow.setFullScreen(true);
        }
    });

    ipcMain.on('window-close', () => {
        mainWindow.close();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});