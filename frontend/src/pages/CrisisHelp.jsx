import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import resourceService from "../services/resourceService";
import contactService from "../services/contactService";
import "../styles/contacts.css";

export default function CrisisHelp() {
  const { user, isAuth } = useAuth();
  const [helplines, setHelplines] = useState([]);
  const [personalContacts, setPersonalContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [showAddContact, setShowAddContact] = useState(false);

  useEffect(() => {
    fetchData();
  }, [isAuth]);

  const fetchData = async () => {
    try {
      const promises = [resourceService.getAll("Helpline")];
      if (isAuth) {
        promises.push(contactService.getAll());
      }

      const results = await Promise.all(promises);
      setHelplines(results[0]);
      if (isAuth && results[1]) {
        setPersonalContacts(results[1]);
      }
    } catch (err) {
      console.error("Failed to load contacts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const added = await contactService.add(newContact);
      setPersonalContacts([...personalContacts, added]);
      setNewContact({ name: "", phone: "", relation: "" });
    } catch (err) {
      alert("Failed to add contact. Note: You can only add contacts if you are logged in.");
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Delete this contact?")) return;
    try {
      await contactService.delete(id);
      setPersonalContacts(personalContacts.filter(c => c.id !== id));
    } catch (err) {
      alert("Failed to delete contact");
    }
  };

  return (
    <div className="contacts-container">
      <div className="section-header">
        <h1>Emergency & Support</h1>
        <p>Immediate help and your personal support network.</p>
      </div>

      <div className="contacts-layout">
        {/* Left: Helplines (Global) */}
        <div className="helplines-section">
          <h2>📞 Crisis Helplines</h2>
          <p style={{ marginBottom: '20px', color: '#94a3b8' }}>Curated by MindLink Admins</p>
          <div className="contact-list">
            {loading ? <p>Loading...</p> : helplines.map(h => (
              <div key={h.id} className="contact-card">
                <div style={{ flex: 1 }}>
                  <h3>{h.title}</h3>
                  <p>{h.description}</p>
                </div>
                <a href={`tel:${h.content}`} className="call-btn">Call {h.content}</a>
              </div>
            ))}
            {!loading && helplines.length === 0 && <p className="empty-msg">No helplines listed currently.</p>}
          </div>
        </div>

        {/* Right: Personal Contacts (User Specific) */}
        <div className="personal-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>❤️ My Support Network</h2>
            {isAuth && (
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4ade80',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s'
                }}
                title={showAddContact ? "Close" : "Add Contact"}
              >
                {showAddContact ? "−" : "＋"}
              </button>
            )}
          </div>

          {isAuth ? (
            showAddContact && (
              <form className="add-contact-form" onSubmit={handleAddContact} style={{ animation: 'fadeIn 0.3s' }}>
                <input
                  placeholder="Name (e.g. Mom)"
                  value={newContact.name}
                  onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Phone Number"
                  value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                  required
                />
                <input
                  placeholder="Relationship (Optional)"
                  value={newContact.relation}
                  onChange={e => setNewContact({ ...newContact, relation: e.target.value })}
                />
                <button type="submit">Add Contact</button>
              </form>
            )
          ) : (
            <div className="empty-msg" style={{ marginBottom: '20px' }}>
              Please <a href="/login" style={{ color: '#3b82f6' }}>log in</a> to manage personal contacts.
            </div>
          )}

          <div className="contact-list">
            {loading ? <p>Loading...</p> : personalContacts.map(c => (
              <div key={c.id} className="contact-card">
                <div style={{ flex: 1 }}>
                  <h3>{c.name} <span className="relation">{c.relation}</span></h3>
                  <p>{c.phone}</p>
                </div>
                <div className="actions">
                  <a href={`tel:${c.phone}`} className="call-btn-icon">📞</a>
                  <button className="del-btn" onClick={() => handleDeleteContact(c.id)}>🗑️</button>
                </div>
              </div>
            ))}
            {!loading && personalContacts.length === 0 && <p className="empty-msg">Add your trusted contacts here.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
