const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const wa = require('./whatsapp');

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // em produção, troque pelo domínio do seu frontend
    methods: ['GET', 'POST'],
  },
});

// Passa o io para o módulo WhatsApp
wa.setIO(io);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ status: 'ok', connected: wa.isConnected() });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

  // Envia estado atual ao conectar
  socket.emit('wa:status', {
    connected: wa.isConnected(),
    qr: wa.getQR(),
  });

  if (wa.isConnected()) {
    socket.emit('wa:contacts', wa.getContacts());
  }

  // ── Frontend → WhatsApp ──────────────────────────────────────────────────

  socket.on('wa:connect', async () => {
    console.log('[Socket.io] Solicitação de conexão WhatsApp');
    try {
      await wa.connect();
    } catch (e) {
      console.error('[WhatsApp] Erro ao conectar:', e.message);
    }
  });

  socket.on('wa:disconnect', async () => {
    console.log('[Socket.io] Solicitação de desconexão WhatsApp');
    await wa.disconnect();
  });

  socket.on('wa:send', async ({ jid, text }, callback) => {
    try {
      await wa.sendMessage(jid, text);
      if (callback) callback({ ok: true });
    } catch (e) {
      if (callback) callback({ ok: false, error: e.message });
    }
  });

  socket.on('wa:messages', ({ jid }, callback) => {
    const messages = wa.getMessages(jid);
    wa.markAsRead(jid);
    if (callback) callback(messages);
  });

  socket.on('wa:contacts', (callback) => {
    if (callback) callback(wa.getContacts());
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`[WhatsApp Service] Rodando na porta ${PORT}`);
  console.log(`[WhatsApp Service] Acesse http://localhost:${PORT}`);
});