const { Server } = require('socket.io');
const { setIO } = require('../services/notificationService');
const registerHandlers = require('./handlers');

const initSocket = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: '*' } });
  setIO(io);
  io.on('connection', (socket) => registerHandlers(io, socket));
  console.log('📡 Socket.IO initialized');
};

module.exports = initSocket;