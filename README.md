# 🕵️‍♂️ CONAN - Private Investigator

**CONAN** is a local-only, high-performance personal knowledge base inspired by the **P.A.R.A. methodology** and stylized with a forensic/investigative theme. Unlike traditional note-taking apps, CONAN is designed for deep interlinking, rapid evidence capture, and forensic analysis of your personal data.

## 👓 Core Philosophy: P.A.R.A. System

CONAN organizes information by **actionability**, not just topics:
- **P - Projects**: Goal-oriented cases with a hard deadline. Missing a deadline? Conan will flag it ⚠️.
- **A - Areas**: Spheres of ongoing responsibility (e.g., Health, Finances).
- **R - Resources**: Your personal library of clues, interest, and research.
- **A - Archives**: Solved cases and inactive evidence.

## 🧪 Key Features

### 🛠 Investigator Toolkit (Slash Menu)
Press `/` to open the technical toolkit. Instantly add:
- **Witness Statements** (Quotes with technical styling).
- **Source Code** (Technical dark blocks for scripts).
- **Visual Evidence** (Images with resizing capabilities).
- **Checklists** (To-do items with clean strike-through logic).
- **Data Grids** (Compact tables).

### 🔍 Global Investigation Board
- **Full-Text Search**: Search through titles, blocks, and tags.
- **Evidence Tagging**: Use `#clues` to link information across different case files.
- **Wiki-Links**: Interconnect notes using `[[Page Title]]`. CONAN automatically tracks **Backlinks** (Cross References) at the bottom of every page.

### 🧪 Crime Lab (Forensic Stats)
A dedicated dashboard to visualize your knowledge base:
- **Case Distribution**: See how your PARA categories are balanced.
- **Top Clues**: Interactive tag cloud of your most used tags.
- **Connection Map**: Tracks the total number of internal links and evidence pieces.

### 🔒 Security & Privacy
- **Local-Only**: Your "Case Files" are stored in a local `local.db` SQLite database. Nothing leaves your machine.
- **Basic Auth**: Single-user protection via `.env` credentials.
- **Backup**: One-click ZIP export of all your evidence and images.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Your Badge (Credentials)
Copy `.env.example` to `.env` and set your username/password.
```bash
cp .env.example .env
```

### 3. Initialize Database
The database (`local.db`) initializes automatically on the first run.

### 4. Start Investigation
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## ⌨️ Shortcut Keys
- `CMD + K`: Open Quick Search.
- `/`: Open Investigator Toolkit.
- `[[`: Start linking another case file.
- `CMD + B / I / U`: Rich text formatting.

---
*"One truth prevails!"* 🔍👓🚀
