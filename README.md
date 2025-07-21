# ♟️ Chess Analyzer AI

Proyek real-time Chess Analyzer dengan komentator AI berbasis **Stockfish** dan **Google Gemini API**.
Dibangun dengan HTML, JavaScript, dan Node.js, sistem ini mengevaluasi posisi catur dan memberikan komentar strategis seolah-olah kamu dilatih oleh Grandmaster!

<p align="center">
  <img width="900" src="https://github.com/user-attachments/assets/a9e79bc6-49dd-4e16-832a-0cd374cb8f29" alt="Chess Analyzer Screenshot">
</p>

---

## 🚀 Fitur Unggulan

* 🔍 Analisis posisi catur berdasarkan FEN (Forsyth–Edwards Notation)
* 🤖 Rekomendasi langkah terbaik menggunakan engine Stockfish
* 💬 Komentar AI berdasarkan analisis Gemini (Google AI)
* 🔄 Undo/Redo langkah menggunakan scroll mouse
* 🧠 Highlight langkah, panah, dan flip papan
* 🎨 UI clean dan responsif dengan chessboard interaktif

---

## 📂 Struktur Folder

```
chess-analyzer-ai/
├── backend/               # Server Node.js, integrasi Stockfish & Gemini
├── frontend/              # UI papan catur, style, logic interaksi pengguna

```

---

## 🛠️ Cara Menjalankan

### 1. Persiapan

* Dapatkan API key Gemini dari: https://aistudio.google.com/app/apikey

### 2. Setup Server

1. Buka terminal:

```bash
cd backend
```

2. Install dependensi:

```bash
npm install
```

3. Buka file `.env` di dalam folder `backend/`:

```
GEMINI_API_KEY="TEMPEL_API_DISINI"
```

4. Jalankan server:

```bash
node server.js
```

### 3. Jalankan Frontend

* Buka `frontend/chess-ai/index.html` langsung via browser (double klik / buka via Live Server)

---

## 📸 Tampilan Aplikasi

<p align="center"> <img width="900" src="https://github.com/user-attachments/assets/3b016a7e-311a-462e-8ce8-7c84e1591e2d" alt="UI Screenshot"> </p>

---

## 🔧 Teknologi yang Digunakan

* ♟️ [Stockfish](https://stockfishchess.org/)
* 🧠 [Gemini API (Google AI)](https://aistudio.google.com/)
* ⚙️ Node.js + Express
* 🕹️ Chessboard.js + Chess.js
* 💻 Vanilla JavaScript, HTML, CSS

---

🧠 Cara Kerja Sistem
* Pemain melakukan langkah di papan.
* Langkah dikonversi menjadi FEN dan dikirim ke backend.
* Backend memanggil Stockfish untuk menentukan langkah terbaik dan evaluasi centipawn.
* Backend kemudian mengirim prompt ke Gemini API berdasarkan FEN, evaluasi, dan langkah terbaik.
* Komentar AI ditampilkan ke pengguna dalam UI sebagai pembelajaran taktis.

---

## 👤 Dibuat oleh

**Yoel Siregar**
📫 GitHub: https://github.com/yoelsrg

“Catur itu latihan otak, tapi AI bikin lo jadi grandmaster dadakan.”
— Yoel, setelah pakai Chess Analyzer AI 😎

---

