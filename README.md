# \# Augment

# AI-Augmented Mini IDE with Monaco, File Explorer, Tabs, and Local Ollama Assistant

# 

# Augment is a lightweight, AI-assisted IDE built using Electron, Monaco Editor, a file explorer with tabs, and a powerful local AI assistant powered by Ollama. It is designed to be fast, minimal, and fully offline-capable.

# 

# This project aims to provide a small but capable editor that feels like a simplified VS Code with built-in AI features and a clean, focused interface.

# 

# ---

# 

# \## Features

# 

# \- Full Monaco code editor with syntax highlighting  

# \- File explorer with folder navigation and collapsible directories  

# \- Multi-tab editing for multiple open files  

# \- Create, open, edit, save, and save-as support  

# \- Create new files and folders inside the project directory  

# \- Local AI assistant powered by Ollama  

# \- Explain, refactor, or generate tests for selected code  

# \- Analyze the entire file with “Ask About Current File”  

# \- Custom Help menu with Documentation and Instructions  

# \- Opens local HTML help files in the user's default browser  

# \- Supports building installers using electron-builder  

# \- Clean modern UI with dark theme

# 

# ---

# 

# \## Requirements

# 

# \- Node.js and npm  

# \- Electron  

# \- Ollama installed on your system  

# \- An Ollama model such as `llama3.2` or `codellama`  

# \- macOS, Windows, or Linux system

# 

# ---

# 

# \## Installation

# 

# 1\. Clone or download this project.  

# 2\. Install dependencies:

# 

# ```

# npm install

# ```

# 

# 3\. Generate icons:

# 

# ```

# npm run icons

# ```

# 

# 4\. Start the application:

# 

# ```

# npm start

# ```

# 

# ---

# 

# \## Running Ollama

# 

# Augment requires a locally running Ollama instance.

# 

# 1\. Install Ollama from https://ollama.com  

# 2\. Pull a model:

# 

# ```

# ollama pull llama3.2

# ```

# 

# 3\. Start the Ollama server:

# 

# ```

# ollama serve

# ```

# 

# Keep Ollama running while using Augment.

# 

# ---

# 

# \## How to Use Augment

# 

# \### Opening a Project

# 

# \- Click \*\*Open Folder\*\* in the top bar.  

# \- Choose a project directory.  

# \- The left sidebar will populate with the file tree.

# 

# \### Editing Files

# 

# \- Click files in the explorer to open them in tabs.  

# \- Tabs show unsaved changes with a dot indicator.  

# \- Use \*\*Save\*\* or \*\*Save As\*\* to write changes to disk.

# 

# \### Creating Files and Folders

# 

# \- Use \*\*New File\*\* to create an untitled tab.  

# \- Use \*\*New Folder\*\* inside the sidebar to create directories inside the selected folder.

# 

# \### AI Tools (Ollama Assistant)

# 

# \- \*\*Ask AI\*\* for general questions.  

# \- \*\*Ask About Current File\*\* for full-file analysis.  

# \- \*\*Explain Selection\*\* for selected code explanations.  

# \- \*\*Refactor Selection\*\* for improvement suggestions.  

# \- \*\*Generate Tests\*\* to generate test scenarios.  

# \- Change the \*\*Model\*\* field to use a different Ollama model.

# 

# ---

# 

# \## Help Menu

# 

# Augment includes a custom Help menu:

# 

# \- Documentation  

# \- Instructions  

# \- Toggle Developer Tools  

# 

# Selecting Documentation or Instructions opens a local HTML file in the user's default browser.

# 

# ---

# 

# \## Building Augment (Optional)

# 

# If electron-builder is installed, you can generate installers.

# 

# Build for current OS:

# 

# ```

# npm run build

# ```

# 

# Build for specific platforms:

# 

# ```

# npm run build:win

# npm run build:mac

# npm run build:linux

# ```

# 

# Installers appear in the `dist/` directory.

# 

# ---

# 

# \## Project Structure

# 

# ```

# augment/

# &nbsp; assets/

# &nbsp;   logo/

# &nbsp;     augment-logo.svg

# &nbsp; build/

# &nbsp;   icons/

# &nbsp; scripts/

# &nbsp;   generate-icons.js

# &nbsp; documentation.html

# &nbsp; instructions.html

# &nbsp; main.js

# &nbsp; preload.js

# &nbsp; renderer.js

# &nbsp; index.html

# &nbsp; style.css

# &nbsp; package.json

# &nbsp; README.md

# ```

# 

# ---

# 

# \## License

# 

# This project is intended for personal, educational, and internal developer use. Adapt freely.

# 

# ---

# 

# \## Notes

# 

# \- Augment runs entirely locally and requires no internet access.  

# \- All AI processing happens through the local Ollama engine.  

# \- Ideal for offline or privacy-focused development workflows.

# 

