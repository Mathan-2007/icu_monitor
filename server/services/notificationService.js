let io;
exports.setIO = (instance) => { io = instance; };
exports.emitToRoom = (room, event, payload) => { if (io) io.to(room).emit(event, payload); };
exports.emitToAll = (event, payload) => { if (io) io.emit(event, payload); };