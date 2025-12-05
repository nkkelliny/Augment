const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Single-file operations
    openFile: () => ipcRenderer.invoke('file:open'),
    saveFileAs: (content) => ipcRenderer.invoke('file:save-as', { content }),
    saveFile: (filePath, content) => ipcRenderer.invoke('file:save', { filePath, content }),

    // Folder & file system
    openFolder: () => ipcRenderer.invoke('fs:open-folder'),
    readFile: (filePath) => ipcRenderer.invoke('fs:read-file', { filePath }),
    writeFile: (filePath, content) => ipcRenderer.invoke('fs:write-file', { filePath, content }),
    createFolder: (rootPath, parentPath, name) =>
        ipcRenderer.invoke('fs:create-folder', { rootPath, parentPath, name }),

    // Ollama
    askOllama: (model, messages) => ipcRenderer.invoke('ollama:chat', { model, messages })
});
