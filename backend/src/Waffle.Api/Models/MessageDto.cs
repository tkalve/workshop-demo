namespace Waffle.Api.Models;

public enum MessageKind
{
    Chat,
    Action,  // /me
    System,
}

public record MessageDto(
    string Nick,
    string Text,
    MessageKind Kind,
    DateTimeOffset SentAt
);
