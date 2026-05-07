import { useState } from 'react';
import { JoinPage } from './pages/Join';
import { ChatPage } from './pages/Chat';
import './styles/main.scss';

type AppState =
  | { screen: 'join'; error?: string }
  | { screen: 'chat'; nick: string };

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'join' });

  if (state.screen === 'join') {
    return (
      <JoinPage
        onJoin={(nick) => setState({ screen: 'chat', nick })}
        error={state.error}
      />
    );
  }

  return (
    <ChatPage
      nick={state.nick}
      onNickChange={(nick) => setState({ screen: 'chat', nick })}
      onJoinFailed={(error) => setState({ screen: 'join', error })}
    />
  );
}
