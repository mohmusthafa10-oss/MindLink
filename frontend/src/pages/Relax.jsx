import { useState, useEffect } from "react";
import "../styles/relax.css";

// Icons 
const HeartIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;
const SunIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>;
const LeafIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em"><path d="M17 8C8 10 5.9 16.17 3.82 21.34 5.66 20 12.44 19 14.22 19c6.17 0 7.78-9 7.78-9 .89-5.11-6-7.89-6-7.89S16.11 7.78 17 8z" /></svg>;
const FeatherIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>;
const CloudIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>;
const MusicIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>;
const StarIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>;
const SmileIcon = () => <svg fill="currentColor" viewBox="0 0 24 24" height="1em" width="1em"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" /></svg>;

const ICONS = [
    { id: 1, icon: <SunIcon /> },
    { id: 2, icon: <LeafIcon /> },
    { id: 3, icon: <FeatherIcon /> },
    { id: 4, icon: <CloudIcon /> },
    { id: 5, icon: <MusicIcon /> },
    { id: 6, icon: <StarIcon /> },
    { id: 7, icon: <SmileIcon /> },
    { id: 8, icon: <HeartIcon /> } // Note: Using heart as content too, though it's also on back
];

export default function Relax() {
    const [cards, setCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [firstCard, setFirstCard] = useState(null);
    const [secondCard, setSecondCard] = useState(null);

    // Initialize Game
    useEffect(() => {
        shuffleCards();
    }, []);

    // Handle Matching Logic
    useEffect(() => {
        if (firstCard && secondCard) {
            setDisabled(true);
            if (firstCard.iconId === secondCard.iconId) {
                // Match!
                setCards(prev => prev.map(card => {
                    if (card.iconId === firstCard.iconId) {
                        return { ...card, isMatched: true };
                    }
                    return card;
                }));
                resetTurn();
            } else {
                // Mismatch
                setTimeout(() => {
                    setCards(prev => prev.map(card => {
                        if (card.id === firstCard.id || card.id === secondCard.id) {
                            return { ...card, isFlipped: false };
                        }
                        return card;
                    }));
                    resetTurn();
                }, 1000);
            }
            setMoves(m => m + 1);
        }
    }, [firstCard, secondCard]);

    // Check Win Condition
    useEffect(() => {
        if (cards.length > 0 && cards.every(card => card.isMatched)) {
            setWon(true);
        }
    }, [cards]);

    const shuffleCards = () => {
        const duplicatedIcons = [...ICONS, ...ICONS];

        // Fisher-Yates shuffle
        const shuffled = duplicatedIcons.sort(() => Math.random() - 0.5).map((item) => ({
            ...item,
            id: Math.random(), // Unique ID for React key
            iconId: item.id,   // ID to match pairs
            isFlipped: false,
            isMatched: false
        }));

        setCards(shuffled);
        setMoves(0);
        setWon(false);
        setFirstCard(null);
        setSecondCard(null);
    };


    const handleCardClick = (card) => {
        if (disabled || card.isFlipped || card.isMatched) return;

        // Flip the card
        setCards(prev => prev.map(c => {
            if (c.id === card.id) return { ...c, isFlipped: true };
            return c;
        }));

        if (!firstCard) {
            setFirstCard(card);
        } else {
            setSecondCard(card);
        }
    };

    const resetTurn = () => {
        setFirstCard(null);
        setSecondCard(null);
        setDisabled(false);
    };

    return (
        <div className="relax-container">
            {won ? (
                <div className="win-screen">
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                    <h1 className="win-title">Mind Cleared!</h1>
                    <p className="win-text">You completed the exercise in {moves} moves.</p>
                    <button className="reset-btn" onClick={shuffleCards}>Play Again</button>
                </div>
            ) : (
                <>
                    <div className="game-header">
                        <div className="stat-box">
                            <span className="stat-label">Moves</span>
                            <span className="stat-value">{moves}</span>
                        </div>
                        <h2 style={{ margin: 0, color: '#76c7b7', fontWeight: 600 }}>Relax & Match</h2>
                        <button className="reset-btn" onClick={shuffleCards}>Reset Game</button>
                    </div>

                    <div className="game-grid">
                        {cards.map(card => (
                            <div
                                key={card.id}
                                className={`card-container ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'card-matched' : ''}`}
                                onClick={() => handleCardClick(card)}
                            >
                                {/* Front: The Icon */}
                                <div className="card-face card-front">
                                    {card.icon}
                                </div>
                                {/* Back: The Pattern */}
                                <div className="card-face card-back">
                                    <HeartIcon />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
