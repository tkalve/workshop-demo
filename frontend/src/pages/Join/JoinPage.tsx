import { useState, type FormEvent } from 'react';

const NICK_PATTERN = /^[a-zA-Z0-9_]{1,20}$/;

interface JoinPageProps {
  onJoin: (nick: string) => void;
  error?: string;
}

export function JoinPage({ onJoin, error }: JoinPageProps) {
  const [nick, setNick] = useState('');
  const [localError, setLocalError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = nick.trim();
    if (!NICK_PATTERN.test(trimmed)) {
      setLocalError('Nickname must be 1–20 alphanumeric characters or underscores.');
      return;
    }
    setLocalError('');
    onJoin(trimmed);
  }

  return (
    <div className="join-page">
      <div className="join-card">
        <img src="/logo.png" alt="Waffle" className="join-card__logo" />
        <h1>Waffle</h1>
        <p className="join-tagline">Pick a nickname to start chatting</p>
        <form onSubmit={handleSubmit} className="join-form">
          <input
            type="text"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="Your nickname"
            maxLength={20}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" disabled={!nick.trim()}>
            Join
          </button>
        </form>
        {(localError || error) && (
          <p className="join-error">{localError || error}</p>
        )}
      </div>
    </div>
  );
}
