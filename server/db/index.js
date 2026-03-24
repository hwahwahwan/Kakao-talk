const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dataDir = path.join(__dirname, '../data')
fs.mkdirSync(dataDir, { recursive: true })

const db = new Database(path.join(dataDir, 'chat.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    email    TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id         TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS room_members (
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         TEXT PRIMARY KEY,
    room_id    TEXT NOT NULL,
    sender_id  TEXT,
    content    TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'text',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (room_id)   REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
  );
`)

module.exports = db
