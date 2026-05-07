export const MessageKind = {
  Chat: 0,
  Action: 1,
  System: 2,
} as const;
export type MessageKind = (typeof MessageKind)[keyof typeof MessageKind];

export interface MessageDto {
  nick: string;
  text: string;
  kind: MessageKind;
  sentAt: string;
}

export interface UserInfoDto {
  nick: string;
  joinedAt: string;
}
