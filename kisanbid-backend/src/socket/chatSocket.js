const { getIo } = require('./socket');
const Message = require('../models/Message');
const logger = require('../utils/logger');

const setupChatSocket = () => {
    const io = getIo();
    if (!io) return;

    io.on('connection', (socket) => {
        socket.on('message:typing', ({ conversationId, isTyping }) => {
            // Broadcast typing status to everyone in the room except sender
            socket.to(`chat:${conversationId}`).emit('message:typing', {
                userId: socket.user.id,
                isTyping
            });
        });

        socket.on('message:read', async ({ conversationId }) => {
            try {
                await Message.updateMany(
                    { conversationId, toId: socket.user.id, read: false },
                    { read: true, readAt: new Date() }
                );
                
                // Notify sender that messages were read
                socket.to(`chat:${conversationId}`).emit('message:read_receipt', {
                    conversationId,
                    userId: socket.user.id
                });
            } catch (err) {
                logger.error('Error marking messages read via socket:', err);
            }
        });
    });
};

module.exports = { setupChatSocket };
