namespace Waffle.Api.Models;

public record ConnectedUser(string ConnectionId, string Nick, DateTimeOffset JoinedAt);
