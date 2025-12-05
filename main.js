const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { pathToFileURL } = require('url');

let mainWindow = null;


function openHelpFile(fileName) {
  const fullPath = path.join(__dirname, fileName);
  const fileUrl = pathToFileURL(fullPath).toString(); // e.g. file:///C:/... or file:///Users/...

  shell.openExternal(fileUrl).catch(err => {
    console.error('Failed to open help file in browser:', fileUrl, err);
  });
}

function createAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // Mac-specific application menu
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
          ]
        }]
      : []),

    // File menu
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },

    // View menu
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Help menu (what you asked to edit)
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => openHelpFile('documentation.html')
        },
        {
          label: 'Instructions',
          click: () => openHelpFile('instructions.html')
        },
        { type: 'separator' },
        {
          label: 'Toggle DevTools',
          role: 'toggleDevTools'
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


function createWindow() {
    const iconPath =
    process.platform === 'win32'
      ? path.join(__dirname, 'build', 'icons', 'icon.ico')     // or augment.ico
      : process.platform === 'darwin'
        ? path.join(__dirname, 'build', 'icons', 'icon.icns')  // or augment.icns
        : path.join(__dirname, 'build', 'icons', 'favicon-256x256.png'); // Linux usually likes PNG

    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        icon: iconPath,   // <-- this is the important part
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});

app.whenReady().then(() => {
  createWindow();
  createAppMenu(); // <-- set up the custom File/Edit/View/Help menu

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});


// ---------- Helpers to build folder tree ----------
function buildTree(dirPath) {
    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
        throw new Error('Not a directory: ' + dirPath);
    }

    function walk(currentPath) {
        const name = path.basename(currentPath);
        const stat = fs.statSync(currentPath);
        if (stat.isDirectory()) {
            const children = fs.readdirSync(currentPath)
                .sort((a, b) => a.localeCompare(b))
                .map(child => walk(path.join(currentPath, child)));
            return {
                name,
                path: currentPath,
                isDir: true,
                children
            };
        } else {
            return {
                name,
                path: currentPath,
                isDir: false
            };
        }
    }

    return walk(dirPath);
}

// ---------- File Open (single file) ----------
ipcMain.handle('file:open', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (canceled || filePaths.length === 0) {
        return { canceled: true };
    }

    const filePath = filePaths[0];
    const content = fs.readFileSync(filePath, 'utf8');

    return {
        canceled: false,
        filePath,
        content
    };
});

// ---------- File Save As ----------
ipcMain.handle('file:save-as', async (event, { content }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        filters: [
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (canceled || !filePath) {
        return { canceled: true };
    }

    fs.writeFileSync(filePath, content, 'utf8');

    return {
        canceled: false,
        filePath
    };
});

// ---------- File Save (existing path) ----------
ipcMain.handle('file:save', async (event, { filePath, content }) => {
    if (!filePath) {
        const res = await dialog.showSaveDialog({
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        if (res.canceled || !res.filePath) {
            return { canceled: true };
        }
        fs.writeFileSync(res.filePath, content, 'utf8');
        return { canceled: false, filePath: res.filePath };
    }

    fs.writeFileSync(filePath, content, 'utf8');
    return { canceled: false, filePath };
});

// ---------- Open Folder & Build Tree ----------
ipcMain.handle('fs:open-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if (canceled || filePaths.length === 0) {
        return { canceled: true };
    }

    const rootPath = filePaths[0];
    const tree = buildTree(rootPath);

    return {
        canceled: false,
        rootPath,
        tree
    };
});

ipcMain.handle('fs:create-folder', async (event, { rootPath, parentPath, name }) => {
    try {
        if (!rootPath || !parentPath || !name) {
            throw new Error('Missing rootPath, parentPath, or name');
        }

        const newFolderPath = path.join(parentPath, name);

        if (fs.existsSync(newFolderPath)) {
            return { ok: false, error: 'Folder already exists.' };
        }

        fs.mkdirSync(newFolderPath, { recursive: true });

        const tree = buildTree(rootPath);

        return {
            ok: true,
            newFolderPath,
            tree
        };
    } catch (err) {
        return { ok: false, error: err.message };
    }
});

// ---------- Read File ----------
ipcMain.handle('fs:read-file', async (event, { filePath }) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return { ok: true, content };
    } catch (err) {
        return { ok: false, error: err.message };
    }
});

// ---------- Write File ----------
ipcMain.handle('fs:write-file', async (event, { filePath, content }) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
});

// ---------- Ollama Chat ----------
ipcMain.handle('ollama:chat', async (event, { model, messages }) => {
    const body = JSON.stringify({
        model: model || 'llama3.2',
        messages,
        stream: false
    });

    const options = {
        hostname: 'localhost',
        port: 11434,
        path: '/api/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
        }
    };

    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk.toString('utf8');
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.message?.content || '';
                    resolve({ ok: true, content });
                } catch (err) {
                    resolve({ ok: false, error: 'Invalid JSON from Ollama: ' + err.message });
                }
            });
        });

        req.on('error', (err) => {
            resolve({ ok: false, error: 'Request error: ' + err.message });
        });

        req.write(body);
        req.end();
    });
});
