import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from '@microsoft/signalr';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MessageDto, UserInfoDto } from '../types';

const HUB_URL = '/hubs/chat';

interface ChatHubEvents {
  onMessage: (msg: MessageDto) => void;
  onUserJoined: (nick: string) => void;
  onUserLeft: (nick: string) => void;
  onNickChanged: (oldNick: string, newNick: string) => void;
  onUserList: (nicks: string[]) => void;
  onWhoIsResult: (info: UserInfoDto) => void;
  onError: (msg: string) => void;
}

export function useChatHub(events: ChatHubEvents) {
  const connRef = useRef<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);

  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    conn.on('ReceiveMessage', (msg: MessageDto) => eventsRef.current.onMessage(msg));
    conn.on('UserJoined', (nick: string) => eventsRef.current.onUserJoined(nick));
    conn.on('UserLeft', (nick: string) => eventsRef.current.onUserLeft(nick));
    conn.on('NickChanged', (oldNick: string, newNick: string) =>
      eventsRef.current.onNickChanged(oldNick, newNick)
    );
    conn.on('UserList', (nicks: string[]) => eventsRef.current.onUserList(nicks));
    conn.on('WhoIsResult', (info: UserInfoDto) => eventsRef.current.onWhoIsResult(info));
    conn.on('Error', (msg: string) => eventsRef.current.onError(msg));

    connRef.current = conn;

    conn
      .start()
      .then(() => setConnected(true))
      .catch((err) => console.error('SignalR connect error:', err));

    conn.onreconnected(() => setConnected(true));
    conn.onreconnecting(() => setConnected(false));
    conn.onclose(() => setConnected(false));

    return () => {
      conn.stop();
    };
  }, []);

  const joinRoom = useCallback((nick: string) => {
    connRef.current?.invoke('JoinRoom', nick);
  }, []);

  const sendMessage = useCallback((text: string) => {
    connRef.current?.invoke('SendMessage', text);
  }, []);

  const sendAction = useCallback((action: string) => {
    connRef.current?.invoke('SendAction', action);
  }, []);

  const changeNick = useCallback((newNick: string) => {
    connRef.current?.invoke('ChangeNick', newNick);
  }, []);

  const whoIs = useCallback((nick: string) => {
    connRef.current?.invoke('WhoIs', nick);
  }, []);

  const isConnected = () =>
    connRef.current?.state === HubConnectionState.Connected;

  return { connected, joinRoom, sendMessage, sendAction, changeNick, whoIs, isConnected };
}
