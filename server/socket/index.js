// central socket handlers
const ChatController = require('../controllers/chatController');

module.exports = function (io) {
  const chat = new ChatController(io);

  io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);

    // register user
    socket.on('user:join', (user, cb) => chat.userJoin(socket, user, cb));

    // join room
    socket.on('room:join', (room, cb) => chat.joinRoom(socket, room, cb));

    // global message
    socket.on('message:send', (payload, cb) => chat.sendMessage(socket, payload, cb));

    // private message
    socket.on('message:private', (payload, cb) => chat.sendPrivateMessage(socket, payload, cb));

    // typing
    socket.on('typing', (payload) => chat.userTyping(socket, payload));

    // read receipt ack
    socket.on('message:read', (payload) => chat.markAsRead(socket, payload));

    // pagination: load older messages
    socket.on('messages:loadMore', (payload, cb) => chat.loadMoreMessages(socket, payload, cb));

    socket.on('disconnect', (reason) => chat.userDisconnect(socket, reason));
  });
};
