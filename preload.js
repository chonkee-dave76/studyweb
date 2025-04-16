const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    toggleFullscreen: () => ipcRenderer.send('window-toggle-fullscreen'),
    close: () => ipcRenderer.send('window-close'),
    getAppPath: async () => {
        const appPath = await ipcRenderer.invoke('get-app-path');
        return appPath;
    },

    getWebViewContent: () => ipcRenderer.invoke('get-webview-content'),
    summariseWebpage: (url) => ipcRenderer.invoke('summarise-webpage', url),
    
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});