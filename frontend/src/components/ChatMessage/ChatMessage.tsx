import type { MessageDto } from '../../types';
import { MessageKind } from '../../types';

interface ChatMessageProps {
  message: MessageDto;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const time = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (message.kind === MessageKind.System) {
    return (
      <div className="chat-message chat-message--system">
        <span className="chat-message__time">{time}</span>
        <span className="chat-message__text">{message.text}</span>
      </div>
    );
  }

  if (message.kind === MessageKind.Action) {
    return (
      <div className="chat-message chat-message--action">
        <span className="chat-message__time">{time}</span>
        <span className="chat-message__text">
          * <strong>{message.nick}</strong> {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className="chat-message">
      <span className="chat-message__time">{time}</span>
      <strong className="chat-message__nick">{message.nick}</strong>
      <span className="chat-message__separator">: </span>
      <span className="chat-message__text">{message.text}</span>
    </div>
  );
}
