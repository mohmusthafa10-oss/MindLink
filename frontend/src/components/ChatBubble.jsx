export default function ChatBubble({ sender, text }) {
  return (
    <div className={sender === "user" ? "user" : "ai"}>
      {text}
    </div>
  );
}
