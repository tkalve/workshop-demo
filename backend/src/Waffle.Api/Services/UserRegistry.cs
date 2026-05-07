using System.Collections.Concurrent;
using Waffle.Api.Models;

namespace Waffle.Api.Services;

public class UserRegistry
{
    private readonly ConcurrentDictionary<string, ConnectedUser> _byConnectionId = new();
    private readonly ConcurrentDictionary<string, string> _nickToConnectionId = new();

    public bool TryAdd(string connectionId, string nick, out string? error)
    {
        error = null;

        if (!IsValidNick(nick))
        {
            error = "Invalid nickname. Use 1–20 alphanumeric characters or underscores.";
            return false;
        }

        if (!_nickToConnectionId.TryAdd(nick, connectionId))
        {
            error = $"Nickname '{nick}' is already taken.";
            return false;
        }

        var user = new ConnectedUser(connectionId, nick, DateTimeOffset.UtcNow);
        _byConnectionId[connectionId] = user;
        return true;
    }

    public bool TryChangeNick(string connectionId, string newNick, out string? oldNick, out string? error)
    {
        oldNick = null;
        error = null;

        if (!_byConnectionId.TryGetValue(connectionId, out var user))
        {
            error = "User not found.";
            return false;
        }

        if (!IsValidNick(newNick))
        {
            error = "Invalid nickname. Use 1–20 alphanumeric characters or underscores.";
            return false;
        }

        if (user.Nick == newNick)
        {
            error = "That is already your nickname.";
            return false;
        }

        if (!_nickToConnectionId.TryAdd(newNick, connectionId))
        {
            error = $"Nickname '{newNick}' is already taken.";
            return false;
        }

        _nickToConnectionId.TryRemove(user.Nick, out _);
        oldNick = user.Nick;
        var updated = user with { Nick = newNick };
        _byConnectionId[connectionId] = updated;
        return true;
    }

    public bool TryRemove(string connectionId, out string? nick)
    {
        nick = null;
        if (!_byConnectionId.TryRemove(connectionId, out var user))
            return false;

        nick = user.Nick;
        _nickToConnectionId.TryRemove(user.Nick, out _);
        return true;
    }

    public ConnectedUser? GetByConnectionId(string connectionId) =>
        _byConnectionId.TryGetValue(connectionId, out var user) ? user : null;

    public ConnectedUser? GetByNick(string nick) =>
        _nickToConnectionId.TryGetValue(nick, out var connectionId)
            ? _byConnectionId.GetValueOrDefault(connectionId)
            : null;

    public IReadOnlyList<string> GetAllNicks() =>
        _byConnectionId.Values.Select(u => u.Nick).OrderBy(n => n).ToList();

    public static bool IsValidNick(string nick) =>
        !string.IsNullOrWhiteSpace(nick)
        && nick.Length <= 20
        && nick.All(c => char.IsLetterOrDigit(c) || c == '_');
}
