// Giả lập độ trễ mạng
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Database trong localStorage để dữ liệu không mất khi reload
const getDb = () =>
  JSON.parse(localStorage.getItem("tivivu_db") || '{"users":[], "chats":[]}');
const saveDb = (db) => localStorage.setItem("tivivu_db", JSON.stringify(db));

export const authService = {
  login: async (email, password) => {
    await delay(800);
    // Logic giả: Cứ nhập là vào, nhưng kiểm tra email format
    if (!email.includes("@")) throw new Error("Invalid email format");
    return {
      id: "user_123",
      email,
      name: email.split("@")[0],
      token: "fake_jwt_token",
    };
  },

  register: async (email, password) => {
    await delay(800);
    return {
      id: "user_new",
      email,
      name: email.split("@")[0],
      token: "fake_jwt_token",
    };
  },
};

export const chatService = {
  getHistory: async (userId) => {
    await delay(500);
    const db = getDb();
    // Lọc chat của user (Mock)
    return db.chats.filter((c) => c.userId === userId) || [];
  },

  createConversation: async (userId) => {
    await delay(300);
    const newChat = {
      id: "chat_" + Date.now(),
      userId,
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    // Lưu vào mock db (chỉ demo memory)
    // const db = getDb(); db.chats.push(newChat); saveDb(db);
    return newChat;
  },

  sendMessage: async (conversationId, message) => {
    await delay(1000); // Giả lập AI đang suy nghĩ

    // Logic AI đơn giản
    let botResponse = "I hear you. Please go on.";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("hello"))
      botResponse =
        "Hello! I am TiViVu AI. How can I help you learn English today?";
    else if (lowerMsg.includes("grammar"))
      botResponse =
        "Grammar is tricky! Try saying a sentence and I will fix it for you.";
    else if (lowerMsg.includes("vocab"))
      botResponse =
        "Vocabulary is key. Click on any word in our chat to see its dictionary definition!";

    return {
      text: botResponse,
      role: "bot",
      timestamp: new Date().toISOString(),
    };
  },
};
