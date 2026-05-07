using Waffle.Api.Services;

namespace Waffle.Api.Tests;

public class UserRegistryTests
{
    private readonly UserRegistry _registry = new();

    [Fact]
    public void TryAdd_ValidNick_ReturnsTrue()
    {
        var result = _registry.TryAdd("conn1", "Alice", out var error);
        Assert.True(result);
        Assert.Null(error);
    }

    [Fact]
    public void TryAdd_DuplicateNick_ReturnsFalse()
    {
        _registry.TryAdd("conn1", "Alice", out _);
        var result = _registry.TryAdd("conn2", "Alice", out var error);
        Assert.False(result);
        Assert.NotNull(error);
        Assert.Contains("taken", error);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("this_nick_is_way_too_long_to_be_valid")]
    [InlineData("bad nick!")]
    [InlineData("has-hyphen")]
    public void TryAdd_InvalidNick_ReturnsFalse(string nick)
    {
        var result = _registry.TryAdd("conn1", nick, out var error);
        Assert.False(result);
        Assert.NotNull(error);
    }

    [Fact]
    public void TryAdd_SameConnectionId_CanRejoin()
    {
        _registry.TryAdd("conn1", "Alice", out _);
        _registry.TryRemove("conn1", out _);
        var result = _registry.TryAdd("conn1", "Alice", out _);
        Assert.True(result);
    }

    [Fact]
    public void TryRemove_ExistingUser_ReturnsNick()
    {
        _registry.TryAdd("conn1", "Bob", out _);
        var result = _registry.TryRemove("conn1", out var nick);
        Assert.True(result);
        Assert.Equal("Bob", nick);
    }

    [Fact]
    public void TryRemove_NonExistentUser_ReturnsFalse()
    {
        var result = _registry.TryRemove("no-such-conn", out var nick);
        Assert.False(result);
        Assert.Null(nick);
    }

    [Fact]
    public void TryRemove_FreesNickForReuse()
    {
        _registry.TryAdd("conn1", "Alice", out _);
        _registry.TryRemove("conn1", out _);
        var result = _registry.TryAdd("conn2", "Alice", out _);
        Assert.True(result);
    }

    [Fact]
    public void TryChangeNick_ValidNewNick_Succeeds()
    {
        _registry.TryAdd("conn1", "Alice", out _);
        var result = _registry.TryChangeNick("conn1", "Alicia", out var oldNick, out var error);
        Assert.True(result);
        Assert.Equal("Alice", oldNick);
        Assert.Null(error);
    }

    [Fact]
    public void TryChangeNick_SameNick_ReturnsFalse()
    {
        _registry.TryAdd("conn1", "Alice", out _);
        var result = _registry.TryChangeNick("conn1", "Alice", out _, out var error);
        Assert.False(result);
        Assert.NotNull(error);
    }

    [Fact]
    public void TryChangeNick_TakenNick_ReturnsFalse()
    {
        _registry.TryAdd("conn1", "Alice", out _);
        _registry.TryAdd("conn2", "Bob", out _);
        var result = _registry.TryChangeNick("conn1", "Bob", out _, out var error);
        Assert.False(result);
        Assert.Contains("taken", error);
    }

    [Fact]
    public void TryChangeNick_OldNickBecomesAvailable()
    {
        _registry.TryAdd("conn1", "Alice", out _);
        _registry.TryChangeNick("conn1", "Alicia", out _, out _);
        var result = _registry.TryAdd("conn2", "Alice", out _);
        Assert.True(result);
    }

    [Fact]
    public void GetByNick_ReturnsCorrectUser()
    {
        _registry.TryAdd("conn1", "Charlie", out _);
        var user = _registry.GetByNick("Charlie");
        Assert.NotNull(user);
        Assert.Equal("Charlie", user.Nick);
        Assert.Equal("conn1", user.ConnectionId);
    }

    [Fact]
    public void GetByNick_UnknownNick_ReturnsNull()
    {
        var user = _registry.GetByNick("nobody");
        Assert.Null(user);
    }

    [Fact]
    public void GetAllNicks_ReturnsSortedList()
    {
        _registry.TryAdd("c1", "Zara", out _);
        _registry.TryAdd("c2", "Alice", out _);
        _registry.TryAdd("c3", "Mike", out _);
        var nicks = _registry.GetAllNicks();
        Assert.Equal(["Alice", "Mike", "Zara"], nicks);
    }

    [Theory]
    [InlineData("ValidNick", true)]
    [InlineData("nick_123", true)]
    [InlineData("a", true)]
    [InlineData("ALLCAPS", true)]
    [InlineData("", false)]
    [InlineData("has space", false)]
    [InlineData("has-dash", false)]
    [InlineData("thisnicknameiswaytoolong123456", false)]
    public void IsValidNick_ReturnsExpected(string nick, bool expected)
    {
        Assert.Equal(expected, UserRegistry.IsValidNick(nick));
    }
}
