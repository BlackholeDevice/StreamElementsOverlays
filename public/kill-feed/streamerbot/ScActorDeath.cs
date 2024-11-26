using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.IO;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ScActorDeath : CPHInlineBase
{
    private static readonly Dictionary<string, int> ActorDeathDataMapping = new()
    {
        { "timestamp", 1 }, //  2024-11-07T03:20:27.053Z
        { "logLevel", 2 }, //  Notice
        { "victim", 3 }, //  Chairman_Dizzle
        { "victimId", 4 }, //  273419037562
        { "zone", 5 }, //  ObjectContainer-0002_INT
        { "attacker", 6 }, //  BlackholeDevice
        { "attackerId", 7 }, //  200217792755
        { "weapon", 8 }, //  behr_smg_ballistic_01_5509431578362
        { "weaponClass", 9 }, //  behr_smg_ballistic_01
        { "damageType", 10 }, //  Bullet
        { "directionX", 11 }, //  0.231702
        { "directionY", 13 }, //  -0.760827
        { "directionZ", 15 } //  -0.606182
    };

    private static readonly Dictionary<string, string> Makes = new()
    {
        { "AEGS", "Aegis" },
        { "ANVL", "Anvil" },
        { "XIAN", "Aopoa" },
        { "XNAA", "Aopoa" },
        { "ARGO", "Argo" },
        { "BANU", "Banu" },
        { "CNOU", "C.O." },
        { "CRUS", "Crusader" },
        { "DRAK", "Drake" },
        { "ESPR", "Esperia" },
        { "GAMA", "Gatac" },
        { "GRIN", "Greycat" },
        { "KRIG", "Kruger" },
        { "MRAI", "Mirai" },
        { "MISC", "MISC" },
        { "ORIG", "Origin" },
        { "RSI", "RSI" },
        { "TMBL", "Tumbril" },
        { "VNCL", "Vanduul" }
    };

    private static readonly string ActorDeathEventPattern =
        @"^<(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)> \[(\w+)\] <Actor Death> CActor::Kill: '(.*)' \[(\d+)\] in zone '(.*)' killed by '(.*)' \[(\d+)\] using '(.*)' \[Class (.*)\] with damage type '(.+)' from direction x: (-?\d+(\.\d+)?), y: (-?\d+(\.\d+)?), z: (-?\d+(\.\d+)?) \[Team_ActorTech\]\[Actor\]$";
    
    private const string Action = "Star Citizen - Events - Actor Death";

    public bool Execute()
    {
        Log("Parsing Actor Death log event");
        var line = (string)args["line"];
        var dict = ParseEvent(line);
        Log($"{dict["attacker"]} killed {dict["victim"]}");
        SetCurrentGameMode(dict);
        SetArgs(dict);
        BroadcastEvent(dict);
        return true;
    }

    private void SetCurrentGameMode(Dictionary<string, object> dict)
    {
        var gameMode = CPH.GetGlobalVar<string>("scGameMode", false) ?? ReadGameModeFromLogs();
        dict.Add("gamerules", gameMode);
    }

    private string ReadGameModeFromLogs()
    {
        Log("Current gamemode unknown. Attempting to read from log file.");
        if (!CPH.TryGetArg("filePath", out _))
        {
            Log("Log file not available. Setting to null.");
            CPH.SetGlobalVar("scGameMode", null, false);
            return null;
        }
        
        var currentLine = (string)args["line"];
        Log("Backed up current line.");
        try
        {
            Log("Reading contents of log file");
            var finalEvent = FindFinalEventFromFile();
            CallContextEstablisherDone(finalEvent);
            if (CPH.TryGetArg("gamerules", out string gameMode))
            {
                Log($"Found game mode to be '{gameMode}'");
                return gameMode;
            }
        }
        finally
        {
            Log("Restoring current line from backup");
            CPH.SetArgument("line", currentLine);
        }

        return "";
    }

    private string FindFinalEventFromFile()
    {
        using var file = File.Open(args["filePath"].ToString()!, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        using var stream = new StreamReader(file);
        var finalEvent = "";
        while (stream.ReadLine() is { } buffer)
        {
            if (buffer.Contains("Context Establisher Done"))
            {
                finalEvent = buffer;
            }
        }

        return finalEvent;
    }


    private void CallContextEstablisherDone(string line)
    {
        CPH.SetArgument("line", line);
        CPH.RunActionById("1d2c12c4-c990-45a4-ac5d-80b89256449a");
    }


    private void SetArgs(Dictionary<string, object> dict)
    {
        foreach (var kvp in dict)
        {
            CPH.SetArgument(kvp.Key, kvp.Value);
        }
    }

    private void BroadcastEvent(Dictionary<string, object> data)
    {
        CPH.SetArgument("websocketData", data);
        CPH.RunActionById("d36ab08f-16da-4015-9bdd-6c1b5ab7a2c5");
    }

    private Dictionary<string, object> ParseEvent(string line)
    {
        var matches = Regex.Match(line, ActorDeathEventPattern);

        var eventData = new Dictionary<string, object>
        {
            { "eventType", "Actor Death" }
        };
        if (!matches.Success)
        {
            return eventData;
        }

        foreach (var kvp in ActorDeathDataMapping)
        {
            eventData.Add(kvp.Key, matches.Groups[kvp.Value].Value);
        }

        CheckAndMarkAsNpc(eventData, "victim");
        FormatActorName(eventData, "victim");

        CheckAndMarkAsNpc(eventData, "attacker");
        FormatActorName(eventData, "attacker");
        FormatZoneName(eventData);
        FormatWeapon(eventData);
        FormatDamageType(eventData);

        return eventData;
    }

    private static void CheckAndMarkAsNpc(Dictionary<string, object> data, string actorType)
    {
        data.Add($"{actorType}IsNpc", data[actorType].ToString()!.Contains(data[$"{actorType}Id"].ToString()!));
    }

    private static void FormatActorName(Dictionary<string, object> data, string actorType)
    {
        var actorName = data[actorType].ToString()!;
        data.TryGetValue($"{actorType}IsNpc", out var npc);
        var isNpc = (bool)(npc ?? false);
        if (!isNpc)
        {
            return;
        }

        GetNpcType(ref actorName);
        data[actorType] = ToTitleCase(actorName);
    }

    private static void GetNpcType(ref string actorName)
    {
        var replacements = new Dictionary<string, string>
        {
            { @"(_\d+){0,2}$", "" },
            { "PU_(Human|Pilots)-", "" },
            { "NPC_Archetypes(_|-)(Male(-|_))?Human(-|_)", "" },
            { "^Guards(-|_)", "" },
            { "-Looted(Hur|MT)", "" },
            { "Test-", "" },
            { "Human-", "" },
            { "BlacJac", "Blacjac" },
            { "distributioncentre", "Distribution Center" },
            { "SCItem_", "" },
            { "_|-", " " }
        };
        ProcessReplacements(replacements, ref actorName);
    }

    private static void FormatZoneName(Dictionary<string, object> data)
    {
        var zone = data["zone"].ToString()!;
        ParseContainers(ref zone);
        ProcessZoneIfShip(ref zone);

        data["zone"] = zone;
    }

    private static void ParseContainers(ref string zone)
    {
        var replacements = new Dictionary<string, string>
        {
            { "OOC_([A-Za-z]+)_([A-Za-z0-9]{1,2})_(.*)", "$3 ($1 $2)" },
            { "ObjectContainer-ugf.*", "Bunker" },
            { "^Hangar_", "Hangar" },
            { "ObjectContainer-0002_INT", "Klescher Interior" }
        };
        ProcessReplacements(replacements, ref zone);
    }

    private static void ProcessZoneIfShip(ref string zone)
    {
        var zoneDupe = zone;
        ProcessReplacements(new Dictionary<string, string>
        {
            { "_PU_AI.*", "" },
            { "_AI_TestReinforcements.*", "" },
            { "_[0-9]+$", "" }
        }, ref zoneDupe);
        var match = Regex.Match(zoneDupe, "^([A-Z]{3,4})_(.*)$");
        if (!match.Success)
        {
            return;
        }

        Makes.TryGetValue(match.Groups[1].Value, out var make);
        var model = match.Groups[2].Value.Replace("_", " ");

        zone = $"{make} {model}";
    }

    private static void FormatWeapon(Dictionary<string, object> data)
    {
        var weapon = data["weapon"].ToString()!;
        ProcessWeaponType(ref weapon);
        data["weapon"] = weapon;
    }

    private static void ProcessWeaponType(ref string weapon)
    {
        ProcessReplacements(new Dictionary<string, string>
        {
            { "^[A-Za-z]{4}_", "" },
            { "_[0-9]{2}_.*", "" },
            { "_[0-9]+$", "" },
            { "([a-z])([A-Z])", "$1 $2" },
            { "smg", "SMG" },
            { "energy", "laser"}
        }, ref weapon);
        
        var parts = weapon.Split('_').Reverse().ToArray();
        weapon = ToTitleCase(string.Join(" ", parts));
    }

    private static void FormatDamageType(Dictionary<string,object> data)
    {
        var damageType = data["damageType"].ToString()!;
        ProcessReplacements(new Dictionary<string, string>
        {
            {"([a-z])([A-Z])", "$1 $2" }
        }, ref damageType);
        data["damageType"] = damageType;
    }

    private static string ToTitleCase(string s)
    {
        return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(s);
    }

    private static void ProcessReplacements(Dictionary<string, string> replacements, ref string text)
    {
        text = replacements.Aggregate(text, (current, kvp) => Regex.Replace(current, kvp.Key, kvp.Value));
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}