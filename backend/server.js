// Memuat environment variables dari file .env
require('dotenv').config(); 
const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const { Chess } = require('chess.js');

// Konfigurasi Aplikasi Express
const app = express();
app.use(express.json());
app.use(cors());

// --- Konfigurasi Gemini API ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
// -----------------------------

/**
 * Fungsi FINAL untuk mendapatkan komentar AI dengan perspektif yang benar
 */
async function getAiCommentary(fen, bestMove, pgn, playerOrientation) {
    try {
        const game = new Chess(fen);
        const from = bestMove.substring(0, 2);
        const to = bestMove.substring(2, 4);

        const pieceNames = { p: 'Pion', n: 'Kuda', b: 'Gajah', r: 'Benteng', q: 'Ratu', k: 'Raja' };
        const piece = game.get(from);
        
        if (!piece) return "Terjadi kesalahan: bidak asal tidak ditemukan.";
        const pieceName = pieceNames[piece.type];

        const moveDetails = game.move({ from, to, promotion: 'q' });

        if (!moveDetails) return `Terjadi kesalahan saat memvalidasi langkah ${bestMove}.`;

        let facts = [];
        
        if (game.isCheckmate()) {
            facts.push(`langkah ini adalah skakmat yang memenangkan permainan.`);
        } else if (game.inCheck()) {
            facts.push(`langkah ${pieceName} dari ${from} ke ${to} ini memberikan skak pada Raja lawan.`);
        } else {
            facts.push(`langkah ini menggerakkan ${pieceName} dari ${from} ke ${to}.`);
        }

        if (moveDetails.captured) {
            facts.push(`Ini juga menangkap ${pieceNames[moveDetails.captured]} lawan.`);
        }

        const newMoves = game.moves({ verbose: true });
        const threats = [];
        for (const m of newMoves) {
            if (m.from === to && m.captured) {
                threats.push(`${pieceNames[m.captured]} di ${m.to}`);
            }
        }
        if (threats.length > 0) {
            facts.push(`Dari posisi barunya, ${pieceName} ini sekarang mengancam ${threats.join(' dan ')}.`);
        }

        // --- LOGIKA BARU UNTUK MENENTUKAN PERSPEKTIF ---
        const turn = game.turn() === 'w' ? 'white' : 'black'; // Giliran siapa SEKARANG (setelah langkah)
        const moveFor = (turn === playerOrientation) ? "Lawan" : "Anda";
        
        const factString = facts.join(' ');
        const prompt = `Anda adalah seorang Grandmaster catur yang sedang mengomentari sebuah permainan dari sudut pandang pemain yang mengontrol bidak ${playerOrientation}.
Konteks Permainan:
- Riwayat PGN: "${pgn}"
- Posisi FEN saat ini: "${fen}"
- Langkah terbaik yang disarankan untuk ${moveFor} adalah ${bestMove}.
- Fakta-fakta kunci tentang langkah ini adalah: "${factString}".

Tugas Anda: Berdasarkan semua informasi di atas, berikan analisis singkat (2-5 kalimat, jangan lebih) kepada saya dengan gaya bahasa gaul dan santai kayak lo lagi nongkrong bareng temen. Jelaskan secara detail MENGAPA langkah ini bagus, apa tujuan utamanya, dan apa rencana lanjutannya (jika ada). berikan analisis nyata dan jangan berhalusinasi, coba kamu visualisasikan dahulu posisinya agar kamu bisa tau posisi dari setiap bidak-bidak saya`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return response.text ? response.text() : "AI tidak dapat memberikan komentar untuk langkah ini.";

    } catch (e) {
        console.error("Error saat memanggil Gemini API:", e);
        return "Gagal mendapatkan komentar AI karena server sibuk atau error.";
    }
}


/**
 * Fungsi untuk menjalankan Stockfish.
 */
function runStockfish(fen) {
    return new Promise((resolve, reject) => {
        const stockfishPath = path.join(__dirname, 'engine', 'stockfish.exe');
        const engine = spawn(stockfishPath);
        let bestMove = null, evaluation = null, lastInfoLine = '';

        engine.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.includes('score cp')) {
                    const match = line.match(/score cp (-?\d+)/);
                    if (match) evaluation = parseInt(match[1], 10);
                }
                if (line.startsWith('bestmove')) {
                    bestMove = line.split(' ')[1];
                    engine.kill();
                    resolve({ bestMove, evaluation });
                }
            });
        });
        engine.on('error', (err) => reject(new Error('Gagal menjalankan engine Stockfish.')));
        engine.on('close', () => { if (bestMove === null) reject(new Error('Proses Stockfish berakhir tak terduga.'))});
        
        engine.stdin.write(`position fen ${fen}\nuci\nisready\ngo depth 15\n`);
    });
}

// ENDPOINT 1: HANYA UNTUK ANALISIS CEPAT (STOCKFISH)
app.post('/analyze', async (req, res) => {
  const { fen } = req.body;
  if (!fen) return res.status(400).json({ error: 'FEN string tidak diberikan' });
  try {
    const { bestMove, evaluation } = await runStockfish(fen);
    res.json({ bestMove, evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT 2: UNTUK MEMINTA KOMENTAR AI (DIPERBARUI)
app.post('/get-commentary', async (req, res) => {
    const { fen, bestMove, pgn, playerOrientation } = req.body;
    if (!fen || !bestMove || !pgn || !playerOrientation) {
        return res.status(400).json({ error: 'Data tidak lengkap untuk meminta komentar' });
    }
    try {
        let explanation = await getAiCommentary(fen, bestMove, pgn, playerOrientation);
        if (!explanation) {
            explanation = "Terjadi kesalahan saat menghasilkan komentar.";
        }
        res.json({ explanation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server backend berjalan di http://localhost:${PORT}`);
});