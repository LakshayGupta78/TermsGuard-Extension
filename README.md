<div align="center">

# 🛡️ TermsGuard Extension

<p>
  <img src="https://img.shields.io/badge/Chrome_Extension-Manifest_v3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-8E75B2?style=for-the-badge&logo=google&logoColor=white" />
</p>

<p><i>Scan any webpage for risky clauses and get a plain English summary 🔍</i></p>

<p>
  <b>Don't Sign Blind. Know Your Terms.</b>
</p>

</div>

---

## 🎯 What It Does

**TermsGuard** is an AI-powered Chrome extension that scans any webpage for risky clauses in Terms & Conditions, Privacy Policies, or any legal documents — and gives you a **clear, plain English summary**.

### ✨ Features

- 🔍 **One-Click Scanning** — Instantly analyze any webpage  
- 🤖 **AI-Powered Analysis** — Uses Gemini AI to detect risks
- ⚠️ **Risk Severity Levels** — Color-coded (🔴 High, 🟡 Medium, 🟢 Low)
- 📝 **Plain English Summaries** — No more legal jargon
- 🔒 **Privacy-First** — Secure backend proxy for API calls

---

## 🚀 Installation

### Developer Mode (Recommended for Testing)

1. **Download** the extension folder or clone this repo:
   ```bash
   git clone https://github.com/LakshayGupta78/TermsGuard-Extension.git
   ```

2. **Open Chrome** and go to `chrome://extensions/`

3. **Enable Developer Mode** (toggle in top-right corner)

4. Click **"Load unpacked"** and select the extension folder

5. 🎉 The TermsGuard icon should appear in your extensions bar!

---

## 📖 How to Use

1. Navigate to any webpage with Terms & Conditions or legal text
2. Click the **TermsGuard** extension icon
3. Press the **"Scan This Page"** button
4. Wait a few seconds for the AI analysis
5. Review the **summary** and **identified risks**

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Platform** | Chrome Extension (Manifest V3) |
| **Frontend** | HTML, CSS, JavaScript |
| **AI Backend** | Gemini AI via secure proxy |
| **API** | Vercel Serverless Functions |

---

## 📁 Project Structure

```
TermsGuard-Extension/
├── manifest.json        # Extension configuration
├── popup/
│   ├── popup.html       # Extension popup UI
│   ├── popup.css        # Popup styles
│   └── popup.js         # Core logic & API calls
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔗 Related Projects

- **[TermsGuard Website](https://github.com/LakshayGupta78/TermsGuard-Website)** — Landing page & document upload tool

---

## 📄 License

Open source under the [MIT License](LICENSE).

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/LakshayGupta78">Lakshay Gupta</a></p>
</div>
