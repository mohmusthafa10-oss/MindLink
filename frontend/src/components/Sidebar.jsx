import { useState, useEffect } from "react";
import "../styles/chat.css";

const PlusIcon = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const MessageIcon = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const TrashIcon = () => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

export default function Sidebar({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, isOpen, toggleSidebar }) {
    return (
        <div className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="new-chat-btn" onClick={onNewChat} role="button">
                <PlusIcon />
                <span>New Chat</span>
            </div>

            <div className="session-list">
                <div className="session-group-title">Recent</div>
                {sessions.map(session => (
                    <div
                        key={session.id}
                        className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                        onClick={() => onSelectSession(session.id)}
                    >
                        <MessageIcon />
                        <span className="session-title">{session.title}</span>
                        <button
                            className="delete-session-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                            }}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
