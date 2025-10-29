const MessageModel = require('../models/messageModel');

class ChatController {
  constructor(io) {
    this.io = io;
    this.users = new Map(); // socketId -> { username, userId }
    this.userByName = new Map(); // username -> socketId (simple mapping)
    this.messageModel = new MessageModel();
  }

  userJoin(socket, user, cb) {
    // user = { userId, username }
    this.users.set(socket.id, user);
    this.userByName.set(user.username, socket.id);

    // broadcast online list
    this.io.emit('users:online', Array.from(this.users.values()));

    socket.broadcast.emit('notification', { text: `${user.username} joined` });

    if (cb) cb({ ok: true, users: Array.from(this.users.values()) });
  }

  joinRoom(socket, room, cb) {
    socket.join(room);
    if (cb) cb({ ok: true, room });
    this.io.to(room).emit('notification', { text: `A user joined ${room}` });
  }

  sendMessage(socket, payload, cb) {
    // payload: { room, text, from }
    const msg = this.messageModel.create({ ...payload, type: 'room' });
    this.io.to(payload.room || 'global').emit('message:new', msg);
    if (cb) cb({ ok: true, id: msg.id });
  }

  sendPrivateMessage(socket, payload, cb) {
    // payload: { toUsername, text, from }
    const toSocketId = this.userByName.get(payload.toUsername);
    const msg = this.messageModel.create({ ...payload, type: 'private' });

    // save then emit to both participants
    socket.emit('message:new', msg);
    if (toSocketId) {
      this.io.to(toSocketId).emit('message:new', msg);
      if (cb) cb({ ok: true });
    } else {
      if (cb) cb({ ok: false, error: 'user-offline' });
    }
  }

  userTyping(socket, payload) {
    // payload: { room, username, isTyping }
    if (payload.room) {
      socket.to(payload.room).emit('typing', payload);
    } else if (payload.toUsername) {
      const toSocketId = this.userByName.get(payload.toUsername);
      if (toSocketId) this.io.to(toSocketId).emit('typing', payload);
    }
  }

  markAsRead(socket, payload) {
    // payload: { messageId, reader }
    this.messageModel.markRead(payload.messageId, payload.reader);
    this.io.emit('message:read', payload);
  }

  loadMoreMessages(socket, payload, cb) {
    // payload: { beforeId, limit, room }
    const messages = this.messageModel.getMessages({ beforeId: payload.beforeId, limit: payload.limit || 20, room: payload.room });
    if (cb) cb({ ok: true, messages });
  }

  userDisconnect(socket, reason) {
    const user = this.users.get(socket.id);
    if (user) {
      this.userByName.delete(user.username);
      this.users.delete(socket.id);
      this.io.emit('users:online', Array.from(this.users.values()));
      this.io.emit('notification', { text: `${user.username} left` });
    }
  }
}

module.exports = ChatController;
