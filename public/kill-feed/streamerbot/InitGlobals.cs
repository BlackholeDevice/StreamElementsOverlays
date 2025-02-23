using System;
using System.Collections.Generic;
using System.Linq;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class InitGlobals : CPHInlineBase
{
    private static readonly ISet<string> Ignore = new HashSet<string>
    {
        "__source",
        "triggerId",
        "triggerName",
        "triggerCategory",
        "actionId",
        "actionName",
        "eventSource",
        "runningActionId",
        "actionQueuedAt",
        "isTest"
    };

    public bool Execute()
    {
        foreach (var arg in args.Where(arg => !Ignore.Contains(arg.Key) && CPH.GetGlobalVar<string>(arg.Key) == null))
        {
            CPH.LogInfo($"Setting argument {arg.Key} to global with value {arg.Value}");
            CPH.SetGlobalVar(arg.Key, $"{arg.Value}".Trim());
        }
        return true;
    }
}