interface UserListProps {
  nicks: string[];
  currentNick: string;
}

export function UserList({ nicks, currentNick }: UserListProps) {
  return (
    <aside className="user-list">
      <div className="user-list__header">Online ({nicks.length})</div>
      <ul className="user-list__items">
        {nicks.map((nick) => (
          <li key={nick} className={`user-list__item${nick === currentNick ? ' user-list__item--self' : ''}`}>
            <span className="user-list__dot" />
            {nick}
            {nick === currentNick && <span className="user-list__you"> (you)</span>}
          </li>
        ))}
      </ul>
    </aside>
  );
}
