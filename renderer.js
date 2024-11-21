document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
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
});