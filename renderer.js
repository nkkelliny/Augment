let editor = null;

// Tabs...
let tabs = [];
let activeTabId = null;

// Folder state
let currentRootFolder = null;
let selectedDirectoryPath = null;  // <--- important

let tabCounter = 1;

// Keep AI messages history if you want to extend later
let aiMessagesHistory = [];

// Monaco loader
window.require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.48.0/min/vs' } });

window.require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: '',
        language: 'plaintext',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: true }
    });

    // Main UI setup
    setupUI(editor);

    // Inline action: Ask AI about selection (context menu)
    editor.addAction({
        id: 'ask-ai-selection',
        label: 'Ask AI about selection (Ollama)',
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 1.5,
        run: async function (ed) {
            const model = ed.getModel();
            if (!model) return;

            const selection = ed.getSelection();
            const text = model.getValueInRange(selection);
            if (!text || !text.trim()) return;

            await sendSelectionToAI('Can you help me understand or improve this selected code?', text);
        }
    });

    // Start with one empty untitled file
    createNewTab(null, '', 'plaintext', 'Untitled-1');
});

// -------------- Utility functions --------------

function getFileNameFromPath(filePath) {
    if (!filePath) return null;
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1] || filePath;
}

function detectLanguageFromExtension(filePath) {
    if (!filePath) return 'plaintext';
    const m = filePath.match(/\.([^.]+)$/);
    if (!m) return 'plaintext';
    const ext = m[1].toLowerCase();
    switch (ext) {
        case 'js':
        case 'mjs':
        case 'cjs':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'cs':
            return 'csharp';
        case 'json':
            return 'json';
        case 'html':
        case 'htm':
            return 'html';
        case 'css':
            return 'css';
        case 'py':
            return 'python';
        default:
            return 'plaintext';
    }
}

function findTabById(id) {
    return tabs.find(t => t.id === id);
}

function findTabByFilePath(filePath) {
    if (!filePath) return null;
    return tabs.find(t => t.filePath === filePath);
}

// -------------- Tab management --------------

function createNewTab(filePath, content, language, displayNameOptional) {
    const id = 'tab-' + (tabCounter++);
    const displayName = displayNameOptional || getFileNameFromPath(filePath) || 'Untitled';

    const lang = language || detectLanguageFromExtension(filePath);
    const model = monaco.editor.createModel(content || '', lang);

    const tab = {
        id,
        filePath: filePath || null,
        displayName,
        model,
        language: lang,
        isDirty: false
    };

    // Track changes for dirty indicator
    model.onDidChangeContent(() => {
        tab.isDirty = true;
        renderTabs();
    });

    tabs.push(tab);
    activeTabId = id;

    editor.setModel(model);
    renderTabs();
    updateFileLabel();
}

function closeTab(tabId) {
    const tab = findTabById(tabId);
    if (!tab) return;

    // Dispose model
    if (tab.model) {
        tab.model.dispose();
    }

    // Remove from tabs
    tabs = tabs.filter(t => t.id !== tabId);

    // If it was active, select another tab
    if (activeTabId === tabId) {
        if (tabs.length > 0) {
            activeTabId = tabs[tabs.length - 1].id;
            const activeTab = findTabById(activeTabId);
            editor.setModel(activeTab.model);
        } else {
            // No tabs left, create a blank one
            createNewTab(null, '', 'plaintext', 'Untitled-' + (tabCounter++));
        }
    }

    renderTabs();
    updateFileLabel();
}

function switchToTab(tabId) {
    const tab = findTabById(tabId);
    if (!tab) return;
    activeTabId = tabId;
    editor.setModel(tab.model);
    renderTabs();
    updateFileLabel();
}

function renderTabs() {
    const tabBar = document.getElementById('tab-bar');
    tabBar.innerHTML = '';

    tabs.forEach(tab => {
        const div = document.createElement('div');
        div.classList.add('tab');
        if (tab.id === activeTabId) {
            div.classList.add('active');
        }
        div.dataset.tabId = tab.id;

        if (tab.isDirty) {
            const dirtySpan = document.createElement('span');
            dirtySpan.classList.add('dirty-indicator');
            dirtySpan.textContent = '●';
            div.appendChild(dirtySpan);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = tab.displayName;
        div.appendChild(nameSpan);

        const closeSpan = document.createElement('span');
        closeSpan.classList.add('close-tab');
        closeSpan.textContent = '×';
        closeSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        });
        div.appendChild(closeSpan);

        div.addEventListener('click', () => {
            switchToTab(tab.id);
        });

        tabBar.appendChild(div);
    });
}

function updateFileLabel() {
    const label = document.getElementById('file-label');
    const active = findTabById(activeTabId);
    if (!active) {
        label.textContent = 'No file open';
        return;
    }
    if (active.filePath) {
        label.textContent = active.filePath + (active.isDirty ? ' *' : '');
    } else {
        label.textContent = active.displayName + (active.isDirty ? ' *' : '');
    }
}

// -------------- File Tree Rendering --------------

function renderFileTree(rootTree) {
    const container = document.getElementById('file-tree');
    container.innerHTML = '';

    function renderNode(node) {
        const wrapper = document.createElement('div');

        const nodeDiv = document.createElement('div');
        nodeDiv.classList.add('file-node');
        nodeDiv.dataset.path = node.path;

        if (node.isDir) {
            nodeDiv.classList.add('directory');
        } else {
            nodeDiv.classList.add('file');
        }

        const chevron = document.createElement('span');
        chevron.classList.add('chevron');
        if (node.isDir) {
            chevron.textContent = '▾';
        } else {
            chevron.textContent = '';
        }
        nodeDiv.appendChild(chevron);

        const icon = document.createElement('span');
        icon.classList.add('icon');
        icon.textContent = node.isDir ? '📁' : '📄';
        nodeDiv.appendChild(icon);

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('name');
        nameSpan.textContent = node.name;
        nodeDiv.appendChild(nameSpan);

        wrapper.appendChild(nodeDiv);

        let childrenContainer = null;
        if (node.isDir && node.children && node.children.length > 0) {
            childrenContainer = document.createElement('div');
            childrenContainer.classList.add('tree-children');

            node.children.forEach(child => {
                const childEl = renderNode(child);
                childrenContainer.appendChild(childEl);
            });

            wrapper.appendChild(childrenContainer);
        }

        // expand/collapse logic
        if (node.isDir && childrenContainer) {
            let collapsed = false;
            nodeDiv.addEventListener('click', (e) => {
                e.stopPropagation();

                // select this directory
                selectedDirectoryPath = node.path;
                document.querySelectorAll('.file-node.selected').forEach(n => n.classList.remove('selected'));
                nodeDiv.classList.add('selected');

                // toggle collapse/expand
                collapsed = !collapsed;
                childrenContainer.style.display = collapsed ? 'none' : 'block';
                chevron.textContent = collapsed ? '▸' : '▾';
            });
        } else if (!node.isDir) {
            nodeDiv.addEventListener('click', async (e) => {
                e.stopPropagation();
                await openFileInTab(node.path);
            });
        }

        return wrapper;
    }

    const rootEl = renderNode(rootTree);
    container.appendChild(rootEl);
}

async function openFileInTab(filePath) {
    // See if there's already a tab for this file
    const existingTab = findTabByFilePath(filePath);
    if (existingTab) {
        switchToTab(existingTab.id);
        return;
    }

    const res = await window.api.readFile(filePath);
    if (!res.ok) {
        alert('Failed to read file: ' + res.error);
        return;
    }

    const language = detectLanguageFromExtension(filePath);
    createNewTab(filePath, res.content, language);
}

// -------------- AI Panel Utilities --------------

function addAiMessage(role, text) {
    const aiMessages = document.getElementById('ai-messages');
    const div = document.createElement('div');
    div.classList.add('ai-message', role);
    div.textContent = text;
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    aiMessagesHistory.push({ role, text });
}

async function sendToOllama(userText, includeFile = false) {
    const modelInput = document.getElementById('model-input');
    const model = modelInput.value.trim() || 'llama3.2';

    const activeTab = findTabById(activeTabId);
    const fileContent = activeTab && activeTab.model ? activeTab.model.getValue() : '';

    let systemPrompt = "You are a helpful coding assistant inside a local IDE. " +
        "Be concise and focus on code-related advice where relevant.";

    if (includeFile && fileContent) {
        systemPrompt += "\n\nWhen helpful, reference the file content the user is editing.";
    }

    const msgs = [
        { role: 'system', content: systemPrompt }
    ];

    if (includeFile && fileContent) {
        msgs.push({
            role: 'user',
            content: "Here is the current file content:\n\n" + fileContent
        });
    }

    msgs.push({
        role: 'user',
        content: userText
    });

    addAiMessage('user', userText);
    addAiMessage('system', `Sending to Ollama (${model})...`);

    const result = await window.api.askOllama(model, msgs);

    // Remove "sending..." bubble
    const aiMessages = document.getElementById('ai-messages');
    const lastChild = aiMessages.lastElementChild;
    if (lastChild && lastChild.classList.contains('system')) {
        aiMessages.removeChild(lastChild);
    }

    if (!result.ok) {
        addAiMessage('system', "Error: " + result.error);
        return;
    }

    addAiMessage('assistant', result.content);
}

async function sendSelectionToAI(instruction, selectedText) {
    const modelInput = document.getElementById('model-input');
    const model = modelInput.value.trim() || 'llama3.2';

    const activeTab = findTabById(activeTabId);
    const fileContent = activeTab && activeTab.model ? activeTab.model.getValue() : '';

    const systemPrompt = "You are a coding assistant integrated into a local IDE. " +
        "The user will provide a code selection and an instruction. " +
        "Respond with focused, practical suggestions and code where appropriate.";

    const msgs = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Instruction: ${instruction}` },
        { role: 'user', content: `Selected code:\n\n${selectedText}` }
    ];

    if (fileContent) {
        msgs.push({
            role: 'user',
            content: "Here is the entire file for additional context:\n\n" + fileContent
        });
    }

    addAiMessage('user', `${instruction}\n\n[Selection]\n${selectedText}`);
    addAiMessage('system', `Sending selection to Ollama (${model})...`);

    const result = await window.api.askOllama(model, msgs);

    const aiMessages = document.getElementById('ai-messages');
    const lastChild = aiMessages.lastElementChild;
    if (lastChild && lastChild.classList.contains('system')) {
        aiMessages.removeChild(lastChild);
    }

    if (!result.ok) {
        addAiMessage('system', "Error: " + result.error);
        return;
    }

    addAiMessage('assistant', result.content);
}

// -------------- UI Setup --------------

function setupUI(editor) {
    const btnOpenFile = document.getElementById('btn-open-file');
    const btnOpenFolder = document.getElementById('btn-open-folder');
    const btnNewFolder = document.getElementById('btn-new-folder');
    const newFolderForm = document.getElementById('new-folder-form');
    const newFolderNameInput = document.getElementById('new-folder-name');
    const btnCreateFolderConfirm = document.getElementById('btn-create-folder-confirm');
    const btnCreateFolderCancel = document.getElementById('btn-create-folder-cancel');
    const btnSave = document.getElementById('btn-save');
    const btnSaveAs = document.getElementById('btn-save-as');
    const btnNewFile = document.getElementById('btn-new-file');
    const languageSelect = document.getElementById('language-select');

    const folderLabel = document.getElementById('folder-label');

    const btnAskAI = document.getElementById('btn-ask-ai');
    const btnAskAboutFile = document.getElementById('btn-ask-ai-about-file');
    const aiInput = document.getElementById('ai-input');

    const btnExplainSelection = document.getElementById('btn-explain-selection');
    const btnRefactorSelection = document.getElementById('btn-refactor-selection');
    const btnGenerateTests = document.getElementById('btn-generate-tests');

    // --- Buttons: Single File Open ---
    btnOpenFile.addEventListener('click', async () => {
        const res = await window.api.openFile();
        if (!res || res.canceled) return;

        // If there's already a tab for this path, reuse
        const existing = findTabByFilePath(res.filePath);
        if (existing) {
            switchToTab(existing.id);
            existing.model.setValue(res.content || '');
            existing.isDirty = false;
            renderTabs();
            updateFileLabel();
            return;
        }

        const lang = detectLanguageFromExtension(res.filePath);
        createNewTab(res.filePath, res.content, lang);
    });

    // --- Buttons: Open Folder ---
    btnOpenFolder.addEventListener('click', async () => {
        const res = await window.api.openFolder();
        if (!res || res.canceled) return;

        currentRootFolder = res.rootPath;
        selectedDirectoryPath = res.rootPath; // root selected
        folderLabel.textContent = res.rootPath;
        renderFileTree(res.tree);
    });

    // --- Buttons: Create Folder ---
    btnNewFolder.addEventListener('click', () => {
        if (!currentRootFolder) {
            // You can replace alert with a custom toast if you prefer
            alert('Open a folder first.');
            return;
        }

        // Show the inline form
        newFolderForm.classList.remove('hidden');
        newFolderNameInput.value = '';
        newFolderNameInput.focus();
    });

    btnCreateFolderCancel.addEventListener('click', () => {
        newFolderForm.classList.add('hidden');
        newFolderNameInput.value = '';
    });

    btnCreateFolderConfirm.addEventListener('click', async () => {
        if (!currentRootFolder) {
            alert('Open a folder first.');
            return;
        }

        const name = newFolderNameInput.value.trim();
        if (!name) {
            // no name entered, just ignore / or show a message
            return;
        }

        const parentPath = selectedDirectoryPath || currentRootFolder;

        const res = await window.api.createFolder(currentRootFolder, parentPath, name);

        if (!res.ok) {
            alert('Failed to create folder: ' + res.error);
            return;
        }

        // hide form, clear input
        newFolderForm.classList.add('hidden');
        newFolderNameInput.value = '';

        // re-render tree
        renderFileTree(res.tree);
    });



    // --- Buttons: Save & Save As ---
    btnSaveAs.addEventListener('click', async () => {
        const activeTab = findTabById(activeTabId);
        if (!activeTab) return;

        const content = activeTab.model.getValue();
        const res = await window.api.saveFileAs(content);
        if (!res || res.canceled) return;

        activeTab.filePath = res.filePath;
        activeTab.displayName = getFileNameFromPath(res.filePath) || activeTab.displayName;
        activeTab.isDirty = false;
        activeTab.language = detectLanguageFromExtension(res.filePath);
        monaco.editor.setModelLanguage(activeTab.model, activeTab.language);

        renderTabs();
        updateFileLabel();
    });

    btnSave.addEventListener('click', async () => {
        const activeTab = findTabById(activeTabId);
        if (!activeTab) return;

        const content = activeTab.model.getValue();
        const res = await window.api.saveFile(activeTab.filePath, content);
        if (!res || res.canceled) return;

        activeTab.filePath = res.filePath;
        if (!activeTab.displayName || activeTab.displayName.startsWith('Untitled')) {
            activeTab.displayName = getFileNameFromPath(res.filePath) || activeTab.displayName;
        }
        activeTab.language = detectLanguageFromExtension(res.filePath);
        monaco.editor.setModelLanguage(activeTab.model, activeTab.language);
        activeTab.isDirty = false;

        renderTabs();
        updateFileLabel();
    });

    // --- New File ---
    btnNewFile.addEventListener('click', () => {
        const name = 'Untitled-' + (tabCounter++);
        createNewTab(null, '', 'plaintext', name);
    });

    // --- Language selection (override auto) ---
    languageSelect.addEventListener('change', () => {
        const activeTab = findTabById(activeTabId);
        if (!activeTab || !activeTab.model) return;

        const value = languageSelect.value;
        let lang;

        if (value === 'auto') {
            // Re-detect from file path
            lang = detectLanguageFromExtension(activeTab.filePath);
        } else {
            lang = value;
        }

        activeTab.language = lang;
        monaco.editor.setModelLanguage(activeTab.model, lang);
    });

    // --- AI basic chat ---
    btnAskAI.addEventListener('click', async () => {
        const text = aiInput.value.trim();
        if (!text) return;
        aiInput.value = '';
        await sendToOllama(text, false);
    });

    // --- AI ask about current file ---
    btnAskAboutFile.addEventListener('click', async () => {
        const text = aiInput.value.trim() || "Please review this file and suggest improvements.";
        aiInput.value = '';
        await sendToOllama(text, true);
    });

    // --- AI tools on selection ---
    function getSelectedText() {
        const model = editor.getModel();
        if (!model) return '';
        const selection = editor.getSelection();
        if (!selection) return '';
        return model.getValueInRange(selection);
    }

    btnExplainSelection.addEventListener('click', async () => {
        const sel = getSelectedText();
        if (!sel.trim()) {
            alert('Select some code first.');
            return;
        }
        await sendSelectionToAI('Explain what this code does, and mention any potential issues.', sel);
    });

    btnRefactorSelection.addEventListener('click', async () => {
        const sel = getSelectedText();
        if (!sel.trim()) {
            alert('Select some code first.');
            return;
        }
        await sendSelectionToAI('Refactor this code for clarity, maintainability, and best practices.', sel);
    });

    btnGenerateTests.addEventListener('click', async () => {
        const sel = getSelectedText();
        if (!sel.trim()) {
            alert('Select the function or method you want tests for.');
            return;
        }
        await sendSelectionToAI('Generate unit tests for this code.', sel);
    });

    newFolderNameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            btnCreateFolderConfirm.click();
        } else if (e.key === 'Escape') {
            btnCreateFolderCancel.click();
        }
    });

}
