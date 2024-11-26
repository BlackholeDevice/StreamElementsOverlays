using System.Text.RegularExpressions;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ScLogReader : CPHInlineBase
{
    private const string Action = "Star Citizen - Log Reader";

    public bool Execute()
    {
        var line = GetEventData();
        var eventType = GetEventType(line);
        var nextAction = $"Star Citizen - Events - {eventType}";

        if (!CPH.ActionExists(nextAction))
        {
            return false;
        }

        CPH.LogInfo($"{Action} - Running log action for event type '{eventType}': '{nextAction}'");
        CPH.SetArgument("line", line);
        CPH.SetArgument("eventType", eventType);
        CPH.SetArgument("handle", CPH.GetGlobalVar<string>("scHandle"));
        CPH.RunAction(nextAction);
        return true;
    }

    public string GetEventData()
    {
        if (!CPH.TryGetArg("data", out string data))
        {
            data = (string)args["line"];
        }

        CPH.SetArgument("line", data);
        return data;
    }

    private static string GetEventType(string text)
    {
        var match = Regex.Match(text, @"<[^>]+>\s*\[[^\]]+\]\s*<([^>]+)>");
        return match.Success ? match.Groups[1].Value : string.Empty;
    }
}