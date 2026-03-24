// node server/seed.js
const db = require('./db/index')
const crypto = require('crypto')

const users = [
  { name: '정용환', email: 'yonghwan@kakao.web', password: '1234' },
  { name: '김민준', email: 'minjun@kakao.web',   password: '1234' },
  { name: '이서연', email: 'seoyeon@kakao.web',  password: '1234' },
  { name: '박지호', email: 'jiho@kakao.web',     password: '1234' },
]

const insert = db.prepare(
  'INSERT OR IGNORE INTO users (id, name, email, password) VALUES (?, ?, ?, ?)'
)

for (const u of users) {
  insert.run(crypto.randomUUID(), u.name, u.email, u.password)
}

console.log('Seed complete')
