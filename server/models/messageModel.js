const { v4: uuidv4 } = require('uuid');

class MessageModel {
  constructor() {
    this.messages = []; // newest at end
  }

  create(payload) {
    const msg = {
      id: uuidv4(),
      text: payload.text || null,
      from: payload.from,
      to: payload.toUsername || null,
      room: payload.room || 'global',
      type: payload.type || 'room',
      timestamp: Date.now(),
      readBy: []
    };
    this.messages.push(msg);
    return msg;
  }

  getMessages({ beforeId, limit = 20, room = 'global' } = {}) {
    const roomMsgs = this.messages.filter(m => m.room === room || m.type === 'private');
    if (!beforeId) return roomMsgs.slice(-limit);

    const idx = roomMsgs.findIndex(m => m.id === beforeId);
    if (idx <= 0) return [];
    const start = Math.max(0, idx - limit);
    return roomMsgs.slice(start, idx);
  }

  markRead(messageId, username) {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg && !msg.readBy.includes(username)) {
      msg.readBy.push(username);
    }
    return msg;
  }
}

module.exports = MessageModel;
