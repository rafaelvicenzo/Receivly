const makeWASocket = require('@whiskeysockets/baileys').default;
const {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');

const messagesMap = new Map();
const contactsMap = new Map();

let sock = null;
let qrBase64 = null;
let connected = false;
let io = null;

function setIO(socketIO) { io = socketIO; }
function emit(event, data) { if (io) io.emit(event, data); }

async function connect() {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    browser: ['Receivly', 'Chrome', '120.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 2000,
    getMessage: async (key) => {
      const msgs = messagesMap.get(key.remoteJid) ?? [];
      const found = msgs.find(m => m.id === key.id);
      return found ? { conversation: found.body } : { conversation: '' };
    },
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('[WhatsApp] QR Code gerado, aguardando scan...');
      qrBase64 = await QRCode.toDataURL(qr);
      connected = false;
      emit('wa:qr', { qr: qrBase64 });
    }

    if (connection === 'open') {
      connected = true;
      qrBase64 = null;
      console.log('[WhatsApp] Conectado com sucesso!');
      emit('wa:status', { connected: true, qr: null });
      emit('wa:contacts', getContacts());
    }

    if (connection === 'close') {
      connected = false;
      emit('wa:status', { connected: false, qr: null });

      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log('[WhatsApp] Conexão encerrada. Status:', statusCode);

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('[WhatsApp] Usuário deslogado, limpando sessão...');
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      } else {
        console.log('[WhatsApp] Reconectando em 5s...');
        setTimeout(() => connect(), 5000);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      const jid = msg.key.remoteJid;
      if (!jid || jid === 'status@broadcast') continue;

      const body = extractBody(msg);
      const timestamp = Number(msg.messageTimestamp) * 1000;

      const chatMsg = {
        id: msg.key.id,
        jid,
        fromMe: msg.key.fromMe ?? false,
        body,
        timestamp,
        status: 'delivered',
      };

      if (!messagesMap.has(jid)) messagesMap.set(jid, []);
      messagesMap.get(jid).push(chatMsg);

      const existing = contactsMap.get(jid);
      const name = msg.pushName || phoneFromJid(jid);

      contactsMap.set(jid, {
        jid,
        name: existing?.name || name,
        phone: phoneFromJid(jid),
        lastMessage: body,
        lastMessageTime: timestamp,
        unreadCount: msg.key.fromMe
          ? (existing?.unreadCount ?? 0)
          : (existing?.unreadCount ?? 0) + 1,
      });

      emit('wa:message', chatMsg);
      emit('wa:contacts', getContacts());
    }
  });

  sock.ev.on('messages.update', (updates) => {
    for (const u of updates) {
      if (!u.key.remoteJid || !u.update.status) continue;
      const msgs = messagesMap.get(u.key.remoteJid) ?? [];
      const msg = msgs.find((m) => m.id === u.key.id);
      if (!msg) continue;
      const statusMap = { 1: 'sent', 2: 'delivered', 3: 'read', 4: 'read' };
      msg.status = statusMap[u.update.status] ?? msg.status;
      emit('wa:message:status', { id: msg.id, jid: msg.jid, status: msg.status });
    }
  });

  sock.ev.on('contacts.upsert', (contacts) => {
    for (const c of contacts) {
      const existing = contactsMap.get(c.id);
      if (existing) {
        existing.name = c.name || c.notify || existing.name;
        contactsMap.set(c.id, existing);
      }
    }
  });
}

async function disconnect() {
  try { await sock?.logout(); } catch (_) {}
  sock = null;
  connected = false;
  messagesMap.clear();
  contactsMap.clear();
  fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  emit('wa:status', { connected: false, qr: null });
  console.log('[WhatsApp] Desconectado manualmente.');
}

async function sendMessage(jid, text) {
  if (!sock || !connected) throw new Error('WhatsApp não conectado');
  await sock.sendMessage(jid, { text });
}

function getQR() { return qrBase64; }
function isConnected() { return connected; }

function getContacts() {
  return Array.from(contactsMap.values())
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
}

function getMessages(jid) {
  return messagesMap.get(jid) ?? [];
}

function markAsRead(jid) {
  const c = contactsMap.get(jid);
  if (c) { c.unreadCount = 0; contactsMap.set(jid, c); }
}

function extractBody(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption ||
    (msg.message?.imageMessage    ? '📷 Imagem'    : '') ||
    (msg.message?.audioMessage    ? '🎵 Áudio'     : '') ||
    (msg.message?.videoMessage    ? '🎥 Vídeo'     : '') ||
    (msg.message?.documentMessage ? '📄 Documento' : '') ||
    (msg.message?.stickerMessage  ? '🎭 Sticker'   : '') ||
    ''
  );
}

function phoneFromJid(jid) {
  const n = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
  if (n.startsWith('55') && n.length >= 12) {
    const ddd = n.slice(2, 4);
    const rest = n.slice(4);
    if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
    if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return n;
}

module.exports = {
  setIO, connect, disconnect, sendMessage,
  getQR, isConnected, getContacts, getMessages, markAsRead,
};