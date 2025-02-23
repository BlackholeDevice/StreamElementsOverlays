using System.Collections.Generic;
using System.IO;
using System;
using System.Linq;
using System.Text;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ScSaveEvent : CPHInlineBase
{
    private const string Action = "Star Citizen - Hooks - Save Event";
    private string LogDir { get; set; }
    private string LogFile => Path.Combine(LogDir, $"{args["eventType"]}.csv");

    private readonly Dictionary<string, Func<Dictionary<string, object>, Dictionary<string, object>>> _argParsers = new()
    {
        {"Actor Death", ParseActorDeathArgs }
    };
    
    public bool Execute()
    {
        if (!ShouldSaveEvents())
        {
            return true;
        }
        
        LogDir = CPH.GetGlobalVar<string>("scEventLogs");
        if (string.IsNullOrWhiteSpace(LogDir))
        {
            if (!CPH.TryGetArg("filePath", out string filePath))
            {
                return true;
            }
            LogDir = Path.GetDirectoryName(filePath)!;
        }

        if (!TryCreateLogDirectory())
        {
            return true;
        }

        Log("Saving event to log file.");
        try
        {
            SaveEvent();
        }
        catch(Exception ex)
        {
            // no op
            Log(ex.ToString());
        }

        return true;
    }

    private bool ShouldSaveEvents()
    {
        return CPH.GetGlobalVar<bool>("scSaveEvents");
    }

    private bool TryCreateLogDirectory()
    {
        var priorAttemptFailed = CPH.GetGlobalVar<bool>("scEventsDirectoryFailed", false);
        if (priorAttemptFailed)
        {
            return false;
        }

        if (Directory.Exists(LogDir))
        {
            return true;
        }
        
        try
        {
            Directory.CreateDirectory(LogDir);
            return true;
        }
        catch (Exception ex)
        {
            DisableEventPersistenceForSession(ex.Message);
            return false;
        }
    }

    private void DisableEventPersistenceForSession(string message)
    {
        Log($"Failed to open log file {LogFile}. Will not try again this session. Message: {message}");
        CPH.SetGlobalVar("scEventsDirectoryFailed", true, false);
    }

    private static Dictionary<string, object> GetArgs(Dictionary<string, object> args, string[] argSubset)
    {
        var result = new Dictionary<string, object>();
        foreach (var arg in argSubset)
        {
            args.TryGetValue(arg, out var argValue);
            result.Add(arg, argValue ?? "");
        }

        return result;
    }

    private static Dictionary<string, object> ParseActorDeathArgs(Dictionary<string, object> args)
    {
        return GetArgs(args, new[] { "timestamp", "victim", "victimIsNpc", "attacker", "attackerIsNpc", "weapon", "zone", "gamerules", "line" });
    }

    private void SaveEvent()
    {
        if (args.TryGetValue("eventType", out var eventType) &&
            _argParsers.TryGetValue(eventType.ToString()!, out var parser))
        {
            var eventArgs = parser(args);
            WriteEvent(eventArgs);
        }
        
    }

    private void WriteEvent(Dictionary<string, object> eventArgs)
    {
        using var file = OpenFile();
        WriteToFile(file, eventArgs);
    }

    private FileStream OpenFile()
    {
        var file = LogFile;
        try
        {
            Log($"Opening file {file} for writing...");
            var f =  File.Open(file, FileMode.Append, FileAccess.Write, FileShare.Read);
            if (f.CanWrite)
            {
                return f;
            }
            
            DisableEventPersistenceForSession("File not writable.");
            throw new Exception($"Can not write to {file}");
        }
        catch (Exception ex)
        {
            Log($"Failed to create file {file}. Exception: {ex.Message}");
            throw new Exception($"Failed to create file {file}", ex);
        }
    }

    private void WriteToFile(FileStream file, Dictionary<string, object> eventArgs)
    {
        if (file.Position == 0)
        {
            Log("File is empty. Adding header row");
            Write(file, eventArgs.Keys);
        }

        Log("Writing event data to file.");
        Write(file, eventArgs.Values);
    }

    private void Write(FileStream file, IEnumerable<object> data)
    {
        var bytes = Encode(data);
        file.Write(bytes, 0, bytes.Length);
    }

    private static byte[] Encode(IEnumerable<object> columns)
    {
        return Encoding.UTF8.GetBytes($"\"{string.Join("\",\"", columns)}\"{Environment.NewLine}");
    }
    
    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}