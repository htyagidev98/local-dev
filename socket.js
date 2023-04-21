let io;

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {
                // origin: 'http://localhost:4200',
                origin: 'http://localhost:4200',
                credentials: true
            }
        })
        return io
    },

    getIo: () => {
        if (!io) {
            throw new Error('Io instance not initialised');
        }
        return io
    }
}