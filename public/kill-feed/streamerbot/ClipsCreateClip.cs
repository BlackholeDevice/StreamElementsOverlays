using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ClipsCreateClip : CPHInlineBase
{
    private const string Action = "Clips - Create Clip";

    public bool Execute()
    {
        if (IsNotStreaming())
        {
            return true;
        }

        CreateClip();
        SendMessage();
        return true;
    }

    private bool IsNotStreaming()
    {
        if (!CPH.ObsIsConnected())
        {
            Log("OBS not connected. Attempting to connect.");
            CPH.ObsConnect();
        }

        return !CPH.ObsIsConnected() || !CPH.ObsIsConnected();
    }

    private void CreateClip()
    {
        Log("Attempting to create clip.");
        CPH.RunActionById("a486ce5f-be70-4682-a258-6f196ff53f21");
    }

    private void SendMessage()
    {
        Log("Broadcasting messages to chat");
        CPH.RunActionById("21fcffc6-e128-4fd9-862b-49d37c2d6147");
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}