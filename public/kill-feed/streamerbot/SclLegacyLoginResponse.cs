using System.Text.RegularExpressions;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class SclLegacyLoginResponse : CPHInlineBase
{
    public bool Execute()
    {
        var handle = GetHandle((string)args["line"]);
        CPH.LogInfo($"Star Citizen - Events - Legacy login response - Detecting SC login username is {handle}");
        CPH.SetGlobalVar("scHandle", handle);
        return true;
    }

    private string GetHandle(string text)
    {
        // <2024-11-03T23:49:03.518Z> [Notice] <Legacy login response> [CIG-net] User Login Success - Handle[BlackholeDevice] - Time[204536566] [Team_GameServices][Login]
        var match = Regex.Match(text, @"User Login Success - Handle\[(.*)\] - Time");
        return match.Success ? match.Groups[1].Value : string.Empty;
    }
}