require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const routes = require('./routes')
const { registerSocketHandlers } = require('./handlers/socketHandlers')
const { loadDocuments } = require('./services/ragService')

const PORT = parseInt(process.env.PORT, 10) || 4000
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'

const app = express()
app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())
app.use(routes)

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
})

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket)
})

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)
  await loadDocuments()
})
