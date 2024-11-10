using System.Text.RegularExpressions;
using Streamer.bot.Plugin.Interface;

public class CPHInlineSCLogReader : CPHInlineBase
{
    public bool Execute()
    {
        var line = (string)args["line"];
        var eventType = GetEventType(line);
        var nextAction = $"SCL {eventType}";

        if (!CPH.ActionExists(nextAction))
        {
            return false;
        }
        
        CPH.LogInfo($"SC Log Reader - Running log action for event type '{eventType}': '{nextAction}'");
        CPH.SetArgument("line", line);
        CPH.SetArgument("eventType", eventType);
        CPH.RunAction(nextAction);
        return true;
    }

    private static string GetEventType(string text)
    {
        var match = Regex.Match(text, @"<[^>]+>\s*\[[^\]]+\]\s*<([^>]+)>");
        return match.Success ? match.Groups[1].Value : string.Empty;
    }
}