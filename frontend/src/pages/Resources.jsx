import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import resourceService from "../services/resourceService";
import "../styles/resources.css";

export default function Resources() {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);

    // Admin form state
    const [showForm, setShowForm] = useState(false);
    const [newResource, setNewResource] = useState({
        title: "",
        category: "Article",
        content: "",
        description: "",
    });

    const categories = ["All", "Article", "Exercise", "Technique", "Tip", "Helpline"];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const data = await resourceService.getAll();
            setResources(data);
        } catch (err) {
            setError("Failed to load resources");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        try {
            await resourceService.delete(id);
            setResources(resources.filter((r) => r.id !== id));
        } catch (err) {
            alert("Failed to delete resource");
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await resourceService.add(newResource);
            fetchResources();
            setShowForm(false);
            setNewResource({ title: "", category: "Article", content: "", description: "" });
        } catch (err) {
            alert("Failed to add resource");
        }
    };

    const filteredResources = activeCategory === "All"
        ? resources
        : resources.filter((r) => r.category === activeCategory);

    return (
        <div className="resources-container">
            <div className="resources-header">
                <h1>Mental Health Resources</h1>
                <p>Curated content to support your well-being.</p>
                {user?.is_admin && (
                    <button className="add-btn" onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Cancel" : "+ Add Resource"}
                    </button>
                )}
            </div>

            {showForm && (
                <form className="resource-form" onSubmit={handleAdd}>
                    <h2>New Resource</h2>
                    <input
                        placeholder="Title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        required
                    />
                    <select
                        value={newResource.category}
                        onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                    >
                        {categories.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <textarea
                        placeholder="Content (URL or Text or Phone #)"
                        value={newResource.content}
                        onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                        required
                        rows={6}
                    />
                    <textarea
                        placeholder="Description (Optional)"
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                    />
                    <button type="submit">Publish Resource</button>
                </form>
            )}

            <div className="category-tabs">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`tab ${activeCategory === cat ? "active" : ""}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? <p style={{ textAlign: 'center', color: '#ccc' }}>Loading resources...</p> : (
                <div className="resources-grid">
                    {filteredResources.map((res) => (
                        <div key={res.id} className="resource-card">
                            <div className="card-header">
                                <span className="badge">{res.category}</span>
                                {user?.is_admin && (
                                    <button className="delete-btn" onClick={() => handleDelete(res.id)}>×</button>
                                )}
                            </div>
                            <h3>{res.title}</h3>
                            <p>{res.description}</p>
                            {res.content.startsWith("http") ? (
                                <a href={res.content} target="_blank" rel="noopener noreferrer" className="read-more">
                                    View Resource &rarr;
                                </a>
                            ) : (
                                <div className="text-content">
                                    {res.category === 'Helpline' ? (
                                        <a href={`tel:${res.content}`} style={{ color: '#ef4444', fontWeight: 'bold', textDecoration: 'none' }}>Call {res.content}</a>
                                    ) : (
                                        <>
                                            <div style={{ maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                                {res.content}
                                            </div>
                                            <button
                                                className="read-more"
                                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: '5px', color: 'inherit' }}
                                                onClick={() => setSelectedResource(res)}
                                            >
                                                {res.category === 'Exercise' || res.category === 'Technique' ? 'View Details' : 'Read Article'} &rarr;
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredResources.length === 0 && <p className="no-data" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>No resources found for this category.</p>}
                </div>
            )}

            {/* Content Modal */}
            {selectedResource && (
                <div className="resources-modal-overlay" onClick={() => setSelectedResource(null)}>
                    <div className="resources-modal" onClick={e => e.stopPropagation()}>
                        <div className="resources-modal-header">
                            <div>
                                <span className="badge" style={{ marginBottom: '5px', display: 'inline-block' }}>{selectedResource.category}</span>
                                <h2 style={{ margin: 0, color: '#00d2ff' }}>{selectedResource.title}</h2>
                            </div>
                            <button className="resources-modal-close" onClick={() => setSelectedResource(null)}>×</button>
                        </div>
                        <div className="resources-modal-body">
                            {selectedResource.description && (
                                <div style={{
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    fontStyle: 'italic',
                                    borderLeft: '3px solid #00d2ff'
                                }}>
                                    {selectedResource.description}
                                </div>
                            )}
                            <div style={{ whiteSpace: 'pre-line' }}>
                                {selectedResource.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
