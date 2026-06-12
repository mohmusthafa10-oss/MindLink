import { useState } from "react";
import { sendMessage } from "../services/chatService";

export const useChat = () => {
  const [messages, setMessages] = useState([]);

  const send = async (text) => {
    setMessages([...messages, { sender:"user", text }]);
    const res = await sendMessage(text);
    setMessages(prev => [...prev, { sender:"ai", text:res.data.reply }]);
  };

  return { messages, send };
};
