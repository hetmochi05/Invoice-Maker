# 🧾 Invoice Studio — Professional Invoice Generator

**Invoice Studio** is a fast, fully client-side invoice generator that lets you create, customize, preview, and download professional invoices — right in your browser. No sign-up, no backend, no server calls. Everything runs locally and your data never leaves your device.

🔗 **Live Demo:** [hetmochi05.github.io/Invoice-Maker](https://hetmochi05.github.io/Invoice-Maker/)

---

## 📸 Preview

## Desktop View

<table>
  <tr>
    <td><img src="assets/screenshorts/design 1.png" width="200"/></td>
    <td><img src="assets/screenshorts/design 2.png" width="200"/></td>
    <td><img src="assets/screenshorts/design 3.png" width="200"/></td>
  </tr>
  <tr>
    <td><img src="assets/screenshorts/design 4.png" width="200"/></td>
    <td><img src="assets/screenshorts/design 5.png" width="200"/></td>
    <td><img src="assets/screenshorts/design 6.png" width="200"/></td>
  </tr>
</table>

*Live editor panel (left) with real-time invoice preview (right) — including a fully scannable UPI payment QR code, bank details, and digital signature.*


---

## ✨ Features

### 🎨 Templates & Branding
- 6 distinct invoice templates — Modern Executive, Minimalist, Fintech Emerald, Creative Studio (Coral), Classic Corporate, and Thermal Receipt style
- Custom accent color picker with one-click reset
- Upload your business logo, with an optional center-page watermark (adjustable opacity)
- Invoice status stamps — PAID, PENDING, OVERDUE, DRAFT, CANCELLED

### 💵 Multi-Currency Support
- 9 currencies supported out of the box: INR, USD, EUR, GBP, CAD, AUD, AED, SGD, JPY

### 🧮 Smart Financial Calculations
- Add unlimited line items (or bulk-add 5 at once)
- Discount (%) and Tax/GST (%) fields with automatic calculation
- Optional CGST + SGST tax split (50/50)
- Shipping/extra charges
- "Amount in Words" auto-conversion (supports both Indian numbering — Lakh/Crore — and Western numbering)

### 💳 Payments & QR Codes
- Bank details section (Bank Name, Account Holder, Account Number, IFSC/SWIFT/IBAN)
- UPI ID / payment link field
- **Real, scannable QR code generation** — built with a genuine ISO/IEC 18004-compliant QR encoder (not a placeholder graphic), fully compatible with GPay, PhonePe, Paytm, and any standard QR scanner

### ✍️ Signatures & Notes
- Upload a digital signature image
- Custom terms & conditions / customer notes
- Authorized signatory name and designation

### 🗂️ Data Management
- **Save to History** — store invoices locally in your browser and reload them anytime
- **Export as JSON** — download invoice data for backup or reuse
- **Import JSON** — restore a previously exported invoice
- Auto-saves your current draft to `localStorage` so you never lose work on refresh

### 🖥️ Editor Experience
- Live, real-time preview — see changes instantly as you type
- Zoom controls (Zoom In / Out / Fit to width)
- Dark and Light editor themes
- Fully responsive — works on desktop, tablet, and mobile
- One-click **Print / Save as PDF**

---

## 🛠️ Tech Stack

- **HTML5, CSS3, Vanilla JavaScript** — no frameworks, no build step
- **Zero dependencies** — no npm install, no bundler required
- Custom-built QR code encoder (pure JS, no external API or library)
- `localStorage` for persistence — 100% client-side, no backend or database

---

## 🚀 Getting Started

### Option 1 — Just use it online
Visit the live site: **[hetmochi05.github.io/Invoice-Maker](https://hetmochi05.github.io/Invoice-Maker/)**

### Option 2 — Run it locally

```bash
# Clone the repository
git clone https://github.com/hetmochi05/Invoice-Maker.git

# Navigate into the project folder
cd Invoice-Maker

# Open index.html directly in your browser
# or serve it locally, e.g.:
npx serve .
```

Then open `http://localhost:3000` (or wherever your local server points) in your browser.

No installation, no dependencies, no build process — it just works.

---

## 📁 Project Structure

```text
Invoice-Maker/
│
├── assets/
│   ├── favicon/
│   │   └── favicon.png
│   │
│   ├── images/
│   │   ├── logo.png
│   │   └── Sign.png
│   │
│   └── screenshots/
│       ├── design 1.png
│       ├── design 2.png
│       ├── design 3.png
│       ├── design 4.png
│       ├── design 5.png
│       └── design 6.png
│
├── .gitattributes
├── index.html
├── LICENSE
├── README.md
├── script.js
└── style.css

```
---

## 🖨️ How to Use

1. Clone or download this repository.
2. Open the project folder.
3. Open index.html in your web browser.
4. Fill in your **business details** (name, logo, tax ID, address)
5. Add **client/billing information**
6. Add **line items** — description, quantity, and rate
7. Configure **discounts, tax (GST), and shipping**
8. Add **bank details and UPI ID** to generate a real, scannable payment QR code
9. Upload a **digital signature** (optional)
10. Pick a **template and accent color**
11. Click **Print / Save PDF** to download your finished invoice

You can also click **Sample Data** at any time to see a fully filled-out example invoice.

---

## 🔒 Privacy

Invoice Studio runs entirely in your browser. No invoice data, business details, or client information is ever sent to a server. Saved invoices live only in your browser's `localStorage`.

---

## 📄 License

This project is open source. Feel free to fork, modify, and use it for your own projects.

---

## 🙋 Author

**Het Mochi**
GitHub: [@hetmochi05](https://github.com/hetmochi05)

---

⭐ If you find Invoice Studio useful, consider starring the repo!
