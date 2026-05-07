/**
 * Parses IRC-like commands from a raw input string.
 * Returns an action object describing what to do.
 */
export type ParsedInput =
  | { type: 'message'; text: string }
  | { type: 'me'; action: string }
  | { type: 'nick'; newNick: string }
  | { type: 'who'; nick: string }
  | { type: 'unknown'; command: string };

export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('/')) return { type: 'message', text: trimmed };

  const [cmd, ...rest] = trimmed.slice(1).split(/\s+/);
  const args = rest.join(' ');

  switch (cmd.toLowerCase()) {
    case 'me':
      return { type: 'me', action: args };
    case 'nick':
      return { type: 'nick', newNick: rest[0] ?? '' };
    case 'who': {
      const nick = rest[0]?.replace(/^@/, '') ?? '';
      return { type: 'who', nick };
    }
    default:
      return { type: 'unknown', command: cmd };
  }
}
