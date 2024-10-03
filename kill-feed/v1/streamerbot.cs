using System.Text.RegularExpressions;
using System.Collections.Generic;
using Newtonsoft.Json;
using Streamer.bot.Plugin.Interface;

public class CPHInline
{
    public bool Execute()
    {
        var line = (string) args["line"];

        if (!IsDeathEvent(line))
        {
            return false;
        }

        var dict = ParseLine(line);
        SetArgs(dict);
        BroadcastDeathEvent(dict);
        CPH.LogInfo($"{dict["attacker"]} killed {dict["victim"]}");
        return true;
    }

    private void SetArgs(Dictionary<string, string> dict)
    {
        foreach (var kvp in dict)
        {
            CPH.SetArgument(kvp.Key, kvp.Value);
        }
    }

    private void BroadcastDeathEvent(Dictionary<string, string> data)
    {
        CPH.WebsocketBroadcastJson(JsonConvert.SerializeObject(data));
    }

    private static bool IsDeathEvent(string line)
    {
        return !string.IsNullOrEmpty(line) && line.Contains("<Actor Death>");
    }

    private static Dictionary<string, string> ParseLine(string line)
    {
        return new Dictionary<string, string>
        {
            { "event", "kill-log" },
            { "victim", GetMatch(line, "CActor::Kill: '([^']+)'") },
            { "attacker", GetMatch(line, "killed by '([^']+)'") },
            { "type", GetMatch(line, "damage type '([^']+)'") },
            { "using", GetMatch(line, "using '([^']+)'") },
            { "zone", GetMatch(line, "in zone '([^']+)'") }
        };
    }

    private static string GetMatch(string text, string regex)
    {
        var match = Regex.Match(text, regex);
        return match.Success ? match.Groups[1].Value : string.Empty;
    }
}