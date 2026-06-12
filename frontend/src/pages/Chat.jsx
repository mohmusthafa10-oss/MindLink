import { useState, useRef, useEffect } from "react";
import { sendChat, getSessions, getSessionMessages, deleteSession } from "../services/chatService";
import resourceService from "../services/resourceService";
import Sidebar from "../components/Sidebar";
import "../styles/chat.css";

// Icons...
const ChevronDownIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const MenuIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);


// ... Existing icons ...

function CustomDropdown({ selected, setSelected, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabel = options.find(opt => opt.value === selected)?.label || options[0].label;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    setSelected(value);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedLabel}</span>
        <span className={`custom-arrow ${isOpen ? 'open' : ''}`}><ChevronDownIcon /></span>
      </div>
      {isOpen && (
        <div className="custom-options">
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-option ${selected === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <div style={{ width: '20px', display: 'flex', alignItems: 'center' }}>
                {selected === option.value && <div className="check-icon"><CheckIcon /></div>}
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const RobotIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
  </svg>
);

const UserIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const SendIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const PaperClipIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const FriendIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10"></circle>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const PartnerIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
  </svg>
);

const StrangerIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 00-5 5v2a5 5 0 0010 0V7a5 5 0 00-5-5zM4 19h16v2H4zM4 19a8 8 0 0116 0"></path>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 10h4"></path>
  </svg>
);

const TherapistIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3 5h6l-3 5 3 5h-6l-3-5-3 5H3l3-5-3-5h6z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const BrainIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M3.343 15.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
  </svg>
);


const MicIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const STARTING_MESSAGES = {
  companion: "Hey buddy! What's up?",
  partner: "Hey babe! How are you doing?",
  stranger: "Hello!. How are you doing?.It look like you are dealing with something.Do you want to talk about it?",
  therapist: "Hello! I'm MindLink. How are you feeling today?"
};

export default function Chat() {
  const [mode, setMode] = useState("companion");
  const [messages, setMessages] = useState([
    { text: STARTING_MESSAGES["companion"], sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Crisis support
  const [crisisDetected, setCrisisDetected] = useState(false);
  const [helplines, setHelplines] = useState([]);

  // New features
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchHelplines();
  }, []);

  const fetchHelplines = async () => {
    try {
      const data = await resourceService.getAll("Helpline");
      setHelplines(data);
    } catch (err) {
      console.error("Failed to load helplines", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions", err);
    }
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
    setMessages([{ text: STARTING_MESSAGES[mode], sender: "bot" }]);
    setSelectedImage(null);
    // On mobile, maybe close sidebar
  };

  const loadSession = async (id) => {
    try {
      setLoading(true);
      setCurrentSessionId(id);
      const res = await getSessionMessages(id);
      setMessages(res.data);
      // On mobile, close sidebar
    } catch (err) {
      console.error("Error loading session", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await deleteSession(id);
        if (currentSessionId === id) {
          createNewChat();
        }
        fetchSessions();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Logic handled by onend usually, but simple toggle here
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US'; // Could be dynamic
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.start();
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    // If there is only one message and it is a bot start message, update it to the new mode's start message
    if (messages.length === 1 && messages[0].sender === "bot") {
      setMessages([{ text: STARTING_MESSAGES[newMode], sender: "bot" }]);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    // Append User Message
    const userMsg = { text: input, sender: "user", image: selectedImage };
    setMessages((prev) => [...prev, userMsg]);

    const originalInput = input;
    const originalImage = selectedImage;

    setInput("");
    setSelectedImage(null); // clear input
    setLoading(true);

    try {
      // Send to Backend
      const res = await sendChat(originalInput, mode, currentSessionId, originalImage);
      const { reply, session_id, crisis } = res.data;

      // Show crisis banner if crisis detected
      if (crisis) {
        setCrisisDetected(true);
      }

      // If we didn't have a session ID but got one back, it means a new session was created
      if (!currentSessionId && session_id) {
        setCurrentSessionId(session_id);
        fetchSessions(); // Refresh list to show new chat
      } else {
        // Just refresh to update timestamp/order
        fetchSessions();
      }

      // Append Bot Message
      const botMsg = { text: reply, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error sending message", error);
      setMessages((prev) => [...prev, { text: "Error connecting to server. Please try again later.", sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-layout">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSession}
        onNewChat={createNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div className="toggle-sidebar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </div>

          <div className="chat-title">
            {mode === "companion" && <FriendIcon />}
            {mode === "partner" && <PartnerIcon />}
            {mode === "stranger" && <StrangerIcon />}
            {mode === "therapist" && <TherapistIcon />}
            <span>
              {mode === "companion" && "Best Friend"}
              {mode === "partner" && "Loving Partner"}
              {mode === "stranger" && "The Stranger"}
              {mode === "therapist" && "Dr. Calm Guidance"}
            </span>
          </div>

          {/* Custom Dropdown */}
          <CustomDropdown
            selected={mode}
            setSelected={handleModeChange}
            options={[
              { value: "companion", label: "Friend" },
              { value: "partner", label: "Partner" },
              { value: "stranger", label: "Stranger" },
              { value: "therapist", label: "Calm Guide" }
            ]}
          />
        </div>

        {/* Chat Window */}
        <div id="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`message-container ${msg.sender === "bot" ? "bot-container" : "user-container"}`}>
              <div className={`avatar ${msg.sender === "user" ? "user-avatar" : ""}`}>
                {msg.sender === "bot" ? (
                  mode === "companion" ? <FriendIcon /> :
                    mode === "partner" ? <PartnerIcon /> :
                      mode === "stranger" ? <StrangerIcon /> :
                        mode === "therapist" ? <TherapistIcon /> :
                          <RobotIcon />
                ) : <UserIcon />}
              </div>
              <div className={`message ${msg.sender}`}>
                {msg.text && <span>{msg.text}</span>}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Shared"
                    style={{
                      display: "block",
                      maxWidth: "260px",
                      width: "100%",
                      borderRadius: "10px",
                      marginTop: msg.text ? "8px" : "0"
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Crisis Helpline Banner */}
        {crisisDetected && (
          <div className="crisis-banner">
            <button className="crisis-banner-close" onClick={() => setCrisisDetected(false)} title="Dismiss">×</button>
            <div className="crisis-banner-header">
              <span className="crisis-icon">🆘</span>
              <div>
                <strong>You're not alone — help is available right now</strong>
                <p>Please reach out to a crisis helpline. Trained counselors are here for you 24/7.</p>
              </div>
            </div>
            <div className="crisis-helpline-list">
              {helplines.length > 0 ? helplines.map((h) => (
                <a key={h.id} href={`tel:${h.content}`} className="crisis-call-btn">
                  📞 Call {h.title}: {h.content}
                </a>
              )) : (
                <a href="tel:9152987821" className="crisis-call-btn">
                  📞 Call iCall: 9152987821
                </a>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="chat-input-area">
          {selectedImage && (
            <div className="image-preview">
              <img src={selectedImage} alt="Preview" />
              <button className="remove-image-btn" onClick={() => setSelectedImage(null)}>×</button>
            </div>
          )}
          <div className="input-wrapper">
            <input
              id="userInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={isListening ? "Listening..." : "Type text or attaching image..."}
              disabled={loading}
            />
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect}
            />
            <button className="attach-btn" onClick={() => document.getElementById('fileInput').click()} title="Attach Image">
              <PaperClipIcon />
            </button>
            <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={toggleListening} title="Voice Input">
              <MicIcon />
            </button>
          </div>
          <button className="send-btn" onClick={sendMessage} disabled={loading || (!input.trim() && !selectedImage)}>
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
