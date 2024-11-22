using System.Threading;
using System;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class TwitchCreateClip : CPHInlineBase
{
    private const string Action = "Twitch - Create Clip";

    public bool Execute()
    {
        if (IsNotStreaming())
        {
            Log("Not streaming. Skipping clip creation.");
            return true;
        }


        SetClipMessage(GenerateClip());
        return true;
    }

    private void SetClipMessage(string clipUrl)
    {
        CPH.SetArgument("createClipUrl", clipUrl);
        Log("Setting clip message.");
        FetchCustomMessages();
        CPH.TryGetArg("twitchClipMessage", out string clipMessage);
        if (IsActorDeathEvent())
        {
            Log("Detected star citizen actor death event. Customizing clip message.");
            clipMessage = GetActorDeathSpecificClipMessage();
            CPH.CreateStreamMarker(args["victim"].ToString());
        }

        Log($"Final clip message: {clipMessage}");
        CPH.SetArgument("message", $"{clipMessage} {clipUrl}");
    }

    private string GetActorDeathSpecificClipMessage()
    {
        CPH.RunActionById("88fb02b8-8a4c-4919-b1a0-3a5519f2a4fe");
        CPH.TryGetArg("message", out string message);
        return message;
    }

    private bool IsActorDeathEvent()
    {
        return CPH.TryGetArg("eventType", out string eventType) && eventType == "Actor Death";
    }

    private void FetchCustomMessages()
    {
        CPH.RunActionById("42cccec9-7c9d-4dfb-9b66-3960a88c29d9");
    }

    private string GenerateClip()
    {
        var debugClipUrl = CPH.GetGlobalVar<string>("DEBUG_TWITCH_CLIP");
        if (debugClipUrl != null)
        {
            return debugClipUrl;
        }

        Log("Delaying 5 seconds to prevent clip getting cut off too soon");
        Thread.Sleep(5000);
        return CPH.CreateClip().Url;
    }

    private bool IsNotStreaming()
    {
        return !CPH.ObsIsConnected() || !CPH.ObsIsStreaming();
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}