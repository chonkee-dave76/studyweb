require('dotenv').config();  // Load .env variables
const { app, BrowserWindow, ipcMain } = require('electron');
const axios = require('axios');
const { JSDOM } = require('jsdom');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        frame: false,
        transparent: true,
        webPreferences: {
            contextIsolation: true,
            webviewTag: true,
            preload: `${__dirname}/preload.js`, // Add preload.js for IPC
        },
    });

    // Load the browser UI (browser.html)
    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools();

    // Window Controls
    ipcMain.handle('get-app-path', () => __dirname);
    
    ipcMain.on('window-minimize', () => mainWindow.minimize());

    ipcMain.on('window-toggle-fullscreen', () => {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    });

    ipcMain.on('window-close', () => mainWindow.close());

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

// Function to summarise text using OpenAI
async function summariseText(text) {
    try {
        const apiKey = process.env.OPENAI_API_KEY; // Ensure your .env file has OPENAI_API_KEY
        if (!apiKey) throw new Error("Missing OpenAI API Key");

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: `Summarise this: ${text}` }],
            max_tokens: 150,
        }, {
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
        });

        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error with OpenAI request:", error.response ? error.response.data : error.message);
        return "Error generating summary.";
    }
}

// Extract text from WebView and summarise
ipcMain.handle('summarise-webpage', async (event, htmlContent) => {
    try {
        const dom = new JSDOM(htmlContent);
        const document = dom.window.document;

        // Extract readable text
        const article = document.querySelector('article');
        const mainContent = document.querySelector('main');
        const paragraphs = [...document.querySelectorAll('p, h1, h2, h3')];

        let extractedText = '';
        if (article) extractedText = article.textContent;
        else if (mainContent) extractedText = mainContent.textContent;
        else if (paragraphs.length > 0) extractedText = paragraphs.map(el => el.textContent).join(' ');
        else extractedText = document.body.textContent;

        extractedText = extractedText.replace(/\s+/g, ' ').trim();
        if (!extractedText) return "No readable content found.";

        return await summariseText(extractedText);
    } catch (error) {
        console.error("Error extracting webpage text:", error);
        return "Error processing webpage.";
    }
});