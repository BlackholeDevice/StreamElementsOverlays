using System.Collections.Generic;
using System.Text.RegularExpressions;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class SclContextEstablisherDone : CPHInlineBase
{
    private const string Action = "Star Citizen - Events - Context Establisher Done";

    // <2024-11-24T20:41:34.345Z> [Notice] <Context Establisher Done> establisher="Network" runningTime=4.754377 map="megamap" gamerules="EA_FreeFlight" sessionId="a26102d8deaf5dc3527163000b81755d" [Team_Network][Network][Replication][Loading][Persistence]
    private const string ContextEstablisherDoneEventPattern =
        @"<(.*)> \[([A-Za-z_]+)\] <(Context Establisher Done)> establisher=""([A-Za-z]+)"" runningTime=(\d+(\.\d+)?) map=""([A-Za-z_]+)"" gamerules=""([A-Za-z_]+)"" sessionId=""([0-9a-f\-]+)"" .*";

    private static readonly Dictionary<string, int> ContextEstablisherDoneDataMapping = new()
    {
        { "timestamp", 1 }, //  2024-11-07T03:20:27.053Z
        { "logLevel", 2 }, //  Notice
        { "establisher", 4 }, //  Network
        { "runningTime", 5 }, //  4.123
        { "map", 7 }, //  megamap
        { "gamerules", 8 }, //  SC_Default
        { "sessionId", 9 }, //  abcdef1234567890
    };

    public bool Execute()
    {
        var line = (string)args["line"];
        var data = ParseEvent(line);
        SetArgs(data);
        CPH.SetGlobalVar("scGameMode", data["gamerules"].ToString());
        Log($"Detecting current game mode as {data["gamerules"]}");
        return true;
    }

    private Dictionary<string, object> ParseEvent(string line)
    {
        var eventData = new Dictionary<string, object>
        {
            { "eventType", "Context Establisher Done" }
        };
        var match = Regex.Match(line, ContextEstablisherDoneEventPattern);
        if (!match.Success)
        {
            Log($"Parsing failed: {line}");
            return eventData;
        }

        foreach (var kvp in ContextEstablisherDoneDataMapping)
        {
            eventData.Add(kvp.Key, match.Groups[kvp.Value].Value);
        }

        return eventData;
    }

    private void SetArgs(Dictionary<string, object> dict)
    {
        foreach (var kvp in dict)
        {
            CPH.SetArgument(kvp.Key, kvp.Value);
        }
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}