// Backend Node.js menggunakan Express dan Stockfish
const express = require('express');
const stockfish = require('stockfish');
const app = express();

// Parsel tubuh permintaan JSON
app.use(express.json());

// Izinkan CORS untuk permintaan dari frontend (misalnya file:// atau localhost lain)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

/**
 * Endpoint POST /analyze
 * Menerima JSON: { fen: "<FEN string>" }
 * Mengembalikan JSON: { bestMove: "<lanjut>", evaluation: <centipawn> }
 */
app.post('/analyze', (req, res) => {
  const fen = req.body.fen;
  if (!fen) {
    return res.status(400).json({ error: 'FEN tidak diberikan' });
  }

  const engine = stockfish();
  let bestMove = null;
  let evaluation = null;

  engine.onmessage = function(event) {
    const line = event.data ? event.data : event;
    if (typeof line === 'string') {
      // Cari informasi skor dalam centipawn dari keluaran engine
      if (line.startsWith('info depth') && line.includes('score cp')) {
        const match = line.match(/score cp (-?\\d+)/);
        if (match) {
          evaluation = parseInt(match[1], 10);
        }
      }
      // Bila sudah sampai pada bestmove, kirim hasil ke klien
      else if (line.startsWith('bestmove')) {
        bestMove = line.split(' ')[1];
        res.json({ bestMove, evaluation });
        if (engine.terminate) engine.terminate();
      }
    }
  };

  // Mulai protokol UCI dan atur posisi
  engine.postMessage('uci');
  engine.postMessage('ucinewgame');
  engine.postMessage('position fen ' + fen);
  engine.postMessage('go depth 15');
});

// Jalankan server di port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
