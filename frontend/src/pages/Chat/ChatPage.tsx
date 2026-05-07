import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../../components/ChatMessage';
import { MessageInput } from '../../components/MessageInput';
import { UserList } from '../../components/UserList';
import { useChatHub } from '../../hooks/useChatHub';
import { parseInput } from '../../hooks/parseInput';
import type { MessageDto, UserInfoDto } from '../../types';
import { MessageKind } from '../../types';

interface ChatPageProps {
  nick: string;
  onNickChange: (nick: string) => void;
}

export function ChatPage({ nick, onNickChange }: ChatPageProps) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [currentNick, setCurrentNick] = useState(nick);
  const feedRef = useRef<HTMLDivElement>(null);
  // Tracks the nick to use when (re-)joining after a connection is established.
  // Updated whenever currentNick changes so reconnects use the latest nick.
  const joinNickRef = useRef(nick);
  useEffect(() => { joinNickRef.current = currentNick; }, [currentNick]);

  function addSystemMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      { nick: 'System', text, kind: MessageKind.System, sentAt: new Date().toISOString() },
    ]);
  }

  const { connected, joinRoom, sendMessage, sendAction, changeNick, whoIs } = useChatHub({
    onMessage: useCallback((msg: MessageDto) => {
      setMessages((prev) => [...prev, msg]);
    }, []),
    onUserJoined: useCallback((joinedNick: string) => {
      setUsers((prev) => [...prev.filter((n) => n !== joinedNick), joinedNick].sort());
    }, []),
    onUserLeft: useCallback((leftNick: string) => {
      setUsers((prev) => prev.filter((n) => n !== leftNick));
    }, []),
    onNickChanged: useCallback((oldNick: string, newNick: string) => {
      setUsers((prev) => prev.map((n) => (n === oldNick ? newNick : n)).sort());
      setCurrentNick((cur) => {
        const updated = cur === oldNick ? newNick : cur;
        onNickChange(updated);
        return updated;
      });
    }, [onNickChange]),
    onUserList: useCallback((nicks: string[]) => {
      setUsers(nicks);
    }, []),
    onWhoIsResult: useCallback((info: UserInfoDto) => {
      const joined = new Date(info.joinedAt).toLocaleString();
      addSystemMessage(`${info.nick} joined at ${joined}`);
    }, []),
    onError: useCallback((msg: string) => {
      addSystemMessage(`⚠️ ${msg}`);
    }, []),
  });

  useEffect(() => {
    if (connected) joinRoom(joinNickRef.current);
  }, [connected, joinRoom]);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [messages]);

  function handleSend(raw: string) {
    const parsed = parseInput(raw);
    switch (parsed.type) {
      case 'message':
        sendMessage(parsed.text);
        break;
      case 'me':
        sendAction(parsed.action);
        break;
      case 'nick':
        if (parsed.newNick) changeNick(parsed.newNick);
        else addSystemMessage('Usage: /nick <newNickname>');
        break;
      case 'who':
        if (parsed.nick) whoIs(parsed.nick);
        else addSystemMessage('Usage: /who @nick');
        break;
      case 'unknown':
        addSystemMessage(`Unknown command: /${parsed.command}`);
        break;
    }
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-header__brand">
          <img src="/logo.png" alt="Waffle" className="chat-header__logo" />
          <span className="chat-header__name">Waffle</span>
        </div>
        <span className="chat-header__nick">
          <span className={`chat-header__dot ${connected ? 'chat-header__dot--online' : ''}`} />
          {currentNick}
        </span>
      </header>
      <div className="chat-body">
        <div className="chat-center">
          <div className="chat-feed" ref={feedRef}>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
          </div>
          <UserList nicks={users} currentNick={currentNick} />
        </div>
      </div>
      <div className="chat-input-bar">
        <MessageInput onSend={handleSend} disabled={!connected} />
      </div>
    </div>
  );
}
