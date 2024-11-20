const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('window-minimize'),
    toggleFullscreen: () => ipcRenderer.send('window-toggle-fullscreen'),
    close: () => ipcRenderer.send('window-close'),
});