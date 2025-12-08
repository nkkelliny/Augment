![Augment Logo](https://github.com/Hubbzy/augment/blob/main/assets/logo/augment_logo_long.png)

Augment
=======

![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg) ![Version](https://img.shields.io/badge/version-1.0.0-orange.svg) ![Platform](https://img.shields.io/badge/platform-Electron-47848F.svg) ![License](https://img.shields.io/badge/license-MIT-yellow.svg)

Augment is a lightweight, AI-assisted IDE built using **Electron**, **Monaco Editor**, a file explorer with tabs, and a powerful local AI assistant powered by **Ollama**. It is designed to be fast, minimal, and fully offline-capable.

This project aims to provide a small but capable editor that feels like a simplified VS Code with built-in AI features and a clean, focused interface.

* * *

Features
--------

*   Full Monaco code editor with syntax highlighting
*   File explorer with folder navigation and collapsible directories
*   Multi-tab editing for multiple open files
*   Create, open, edit, save, and save-as support
*   Create new files and folders inside the project directory
*   Local AI assistant powered by Ollama
*   Explain, refactor, or generate tests for selected code
*   Analyze the entire file with "Ask About Current File"
*   Custom Help menu with Documentation and Instructions
*   Opens local HTML help files in the user's default browser
*   Supports building installers using electron-builder
*   Clean modern UI with dark theme

* * *

Requirements
------------

*   Node.js and npm
*   Electron
*   Ollama installed on your system
*   An Ollama model such as `llama3.2` or `codellama`
*   macOS, Windows, or Linux system

* * *

To Use
------

To clone and run this repository, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer.

From your command line:

**1. Clone this repository**

```bash
git clone https://github.com/your-username/augment.git
```

**2. Go into the repository**

```bash
cd augment
```

**3. Install dependencies**

```bash
npm install
```

**4. Generate icons**

```bash
npm run icons
```

**5. Start the application**

```bash
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or run `node` and `electron` from a regular command prompt / PowerShell.

* * *

Running Ollama
--------------

Augment requires a locally running Ollama instance.

**1. Install Ollama**

Download and install from [https://ollama.com](https://ollama.com)

**2. Pull a model**

```bash
ollama pull llama3.2
```

**3. Start the Ollama server**

```bash
ollama serve
```

Keep Ollama running while using Augment.

* * *

How to Use Augment
------------------

### Opening a Project

*   Click **Open Folder** in the top bar.
*   Choose a project directory.
*   The left sidebar will populate with the file tree.

### Editing Files

*   Click files in the explorer to open them in tabs.
*   Tabs show unsaved changes with a dot indicator.
*   Use **Save** or **Save As** to write changes to disk.

### Creating Files and Folders

*   Use **New File** to create an untitled tab.
*   Use **New Folder** inside the sidebar to create directories inside the selected folder.

### AI Tools (Ollama Assistant)

*   **Ask AI** for general questions.
*   **Ask About Current File** for full-file analysis.
*   **Explain Selection** for selected code explanations.
*   **Refactor Selection** for improvement suggestions.
*   **Generate Tests** to generate test scenarios.
*   Change the **Model** field to use a different Ollama model.

* * *

Help Menu
---------

Augment includes a custom Help menu:

*   Documentation
*   Instructions
*   Toggle Developer Tools

Selecting Documentation or Instructions opens a local HTML file in the user's default browser.

* * *

Building Augment (Optional)
----------------------------

If electron-builder is installed, you can generate installers.

**Build for current OS:**

```bash
npm run build
```

**Build for specific platforms:**

```bash
npm run build:win
npm run build:mac
npm run build:linux
```

Installers appear in the `dist/` directory.

* * *

Project Structure
-----------------

```
augment/
  assets/
    logo/
      augment-logo.svg
  build/
    icons/
  scripts/
    generate-icons.js
  documentation.html
  instructions.html
  main.js
  preload.js
  renderer.js
  index.html
  style.css
  package.json
  README.md
```

* * *

Files in This Application
-------------------------

*   `main.js` – Electron main process that creates the application window and handles native functionality
*   `preload.js` – Preload script that exposes safe APIs to the renderer process
*   `renderer.js` – Main application logic for the Monaco editor, file explorer, tabs, and AI integration
*   `index.html` – Main application layout and structure
*   `style.css` – Application styling with dark theme
*   `documentation.html` – Local documentation page
*   `instructions.html` – User instructions page
*   `scripts/generate-icons.js` – Script to generate application icons from the SVG logo

* * *

Notes
-----

*   Augment runs entirely locally and requires no internet access.
*   All AI processing happens through the local Ollama engine.
*   Ideal for offline or privacy-focused development workflows.

* * *

License
-------

This project is intended for personal, educational, and internal developer use. Adapt freely.

* * *

Acknowledgments
---------------

*   [Electron](https://www.electronjs.org/)
*   [Monaco Editor](https://microsoft.github.io/monaco-editor/)
*   [Ollama](https://ollama.com/)
*   [Node.js](https://nodejs.org/)
