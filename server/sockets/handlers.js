const jwt = require('jsonwebtoken');

module.exports = (io, socket) => {
  // Client sends token + role after connecting
  socket.on('join', ({ token, role }) => {
    try {
      if (token) jwt.verify(token, process.env.JWT_SECRET);
      if (role) socket.join(`role:${role}`);
      console.log(`👤 Socket joined: ${socket.id} (${role || 'unknown role'})`);
    } catch { socket.emit('error', 'Invalid token'); }
  });

  socket.on('join:patient', (patientId) => socket.join(`patient:${patientId}`));
  socket.on('leave:patient', (patientId) => socket.leave(`patient:${patientId}`));
  socket.on('disconnect', () => console.log(`👋 Socket left: ${socket.id}`));
};