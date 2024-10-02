using System.Text.RegularExpressions;
using System.Collections.Generic;
using Newtonsoft.Json;
using Streamer.bot.Plugin.Interface;

public class CPHInline
{
    public bool Execute()
    {
        if (!CPH.TryGetArg("line", out string line))
        {
            CPH.LogDebug("No line variable");
            return false;
        }

        if (!IsDeathEvent(line))
        {
            return false;
        }

        var dict = ParseLine(line);
        BroadcastDeathEvent(dict);
        CPH.LogInfo($"{dict["attacker"]} killed {dict["victim"]}");
        return true;
    }

    private void BroadcastDeathEvent(Dictionary<string, string> data)
    {
        CPH.WebsocketBroadcastJson(JsonConvert.SerializeObject(data));
    }

    private bool IsDeathEvent(string line)
    {
        return line.Contains("<Actor Death>");
    }

    private Dictionary<string, string> ParseLine(string line)
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

    private string GetMatch(string text, string regex)
    {
        var match = Regex.Match(text, regex);
        return match.Success ? match.Groups[1].Value : string.Empty;
    }
}