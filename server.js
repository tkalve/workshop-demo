const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// nick -> socket.id mapping for lookups
const users = new Map(); // nick (lowercase) -> { nick, id, joinedAt }

app.use(express.static(path.join(__dirname, 'public')));

function systemMsg(room, text) {
  io.to(room).emit('system', { text, ts: Date.now() });
}

function findUser(nick) {
  return users.get(nick.toLowerCase());
}

io.on('connection', (socket) => {
  let currentNick = null;

  // Client requests to join with a nick
  socket.on('join', ({ nick }, cb) => {
    const trimmed = nick.trim();
    if (!trimmed || !/^[a-zA-Z0-9_-]{1,20}$/.test(trimmed)) {
      return cb({ error: 'Nick must be 1–20 alphanumeric, _ or - characters.' });
    }
    if (findUser(trimmed)) {
      return cb({ error: `Nick "${trimmed}" is already taken.` });
    }

    currentNick = trimmed;
    users.set(currentNick.toLowerCase(), { nick: currentNick, id: socket.id, joinedAt: Date.now() });
    socket.join('general');

    cb({ ok: true });
    systemMsg('general', `🧇 <strong>${currentNick}</strong> has joined the waffle.`);
  });

  // Regular chat message
  socket.on('message', ({ text }) => {
    if (!currentNick || !text.trim()) return;

    const raw = text.trim();

    // --- Commands ---
    if (raw.startsWith('/')) {
      const parts = raw.split(/\s+/);
      const cmd = parts[0].toLowerCase();

      if (cmd === '/me') {
        const action = parts.slice(1).join(' ');
        io.to('general').emit('action', { nick: currentNick, action, ts: Date.now() });
        return;
      }

      if (cmd === '/nick') {
        const newNick = (parts[1] || '').trim();
        if (!newNick || !/^[a-zA-Z0-9_-]{1,20}$/.test(newNick)) {
          return socket.emit('system', { text: '❌ Usage: /nick &lt;newNick&gt; (1–20 alphanumeric, _ or -)' , ts: Date.now() });
        }
        if (findUser(newNick) && newNick.toLowerCase() !== currentNick.toLowerCase()) {
          return socket.emit('system', { text: `❌ Nick "${newNick}" is already taken.`, ts: Date.now() });
        }
        const oldNick = currentNick;
        users.delete(currentNick.toLowerCase());
        currentNick = newNick;
        users.set(currentNick.toLowerCase(), { nick: currentNick, id: socket.id, joinedAt: Date.now() });
        socket.emit('nick_changed', { nick: currentNick });
        systemMsg('general', `✏️ <strong>${oldNick}</strong> is now known as <strong>${currentNick}</strong>.`);
        return;
      }

      if (cmd === '/who') {
        const target = (parts[1] || '').replace(/^@/, '');
        if (!target) {
          // List all users
          const list = [...users.values()].map(u => `<strong>${u.nick}</strong>`).join(', ');
          return socket.emit('system', { text: `👥 Online: ${list || 'nobody'}`, ts: Date.now() });
        }
        const u = findUser(target);
        if (!u) {
          return socket.emit('system', { text: `❓ No user named "${target}".`, ts: Date.now() });
        }
        const since = new Date(u.joinedAt).toLocaleTimeString();
        return socket.emit('system', { text: `👤 <strong>${u.nick}</strong> — online since ${since}`, ts: Date.now() });
      }

      // Unknown command
      return socket.emit('system', { text: `❓ Unknown command. Try /me, /nick, /who.`, ts: Date.now() });
    }

    // Plain message
    io.to('general').emit('message', { nick: currentNick, text: raw, ts: Date.now() });
  });

  socket.on('disconnect', () => {
    if (currentNick) {
      users.delete(currentNick.toLowerCase());
      systemMsg('general', `👋 <strong>${currentNick}</strong> has left the waffle.`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🧇 Waffle is running at http://localhost:${PORT}`);
});
