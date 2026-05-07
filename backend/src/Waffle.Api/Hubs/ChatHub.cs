using Microsoft.AspNetCore.SignalR;
using Waffle.Api.Models;
using Waffle.Api.Services;

namespace Waffle.Api.Hubs;

public class ChatHub(UserRegistry registry) : Hub
{
    public async Task JoinRoom(string nick)
    {
        if (!registry.TryAdd(Context.ConnectionId, nick, out var error))
        {
            await Clients.Caller.SendAsync("Error", error);
            return;
        }

        var allNicks = registry.GetAllNicks();
        await Clients.Caller.SendAsync("UserList", allNicks);

        var joinMsg = new MessageDto("System", $"{nick} has joined", MessageKind.System, DateTimeOffset.UtcNow);
        await Clients.Others.SendAsync("UserJoined", nick);
        await Clients.All.SendAsync("ReceiveMessage", joinMsg);
    }

    public async Task SendMessage(string text)
    {
        var user = registry.GetByConnectionId(Context.ConnectionId);
        if (user is null) return;

        var msg = new MessageDto(user.Nick, text, MessageKind.Chat, DateTimeOffset.UtcNow);
        await Clients.All.SendAsync("ReceiveMessage", msg);
    }

    public async Task SendAction(string action)
    {
        var user = registry.GetByConnectionId(Context.ConnectionId);
        if (user is null) return;

        var msg = new MessageDto(user.Nick, action, MessageKind.Action, DateTimeOffset.UtcNow);
        await Clients.All.SendAsync("ReceiveMessage", msg);
    }

    public async Task ChangeNick(string newNick)
    {
        if (!registry.TryChangeNick(Context.ConnectionId, newNick, out var oldNick, out var error))
        {
            await Clients.Caller.SendAsync("Error", error);
            return;
        }

        await Clients.All.SendAsync("NickChanged", oldNick, newNick);
        var msg = new MessageDto("System", $"{oldNick} is now known as {newNick}", MessageKind.System, DateTimeOffset.UtcNow);
        await Clients.All.SendAsync("ReceiveMessage", msg);
    }

    public async Task WhoIs(string nick)
    {
        var user = registry.GetByNick(nick);
        if (user is null)
        {
            await Clients.Caller.SendAsync("Error", $"No user named '{nick}'.");
            return;
        }

        var info = new UserInfoDto(user.Nick, user.JoinedAt);
        await Clients.Caller.SendAsync("WhoIsResult", info);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (registry.TryRemove(Context.ConnectionId, out var nick))
        {
            await Clients.Others.SendAsync("UserLeft", nick);
            var msg = new MessageDto("System", $"{nick} has left", MessageKind.System, DateTimeOffset.UtcNow);
            await Clients.Others.SendAsync("ReceiveMessage", msg);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
