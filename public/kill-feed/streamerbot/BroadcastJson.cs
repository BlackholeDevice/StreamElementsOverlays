using Newtonsoft.Json;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class BroadcastJson : CPHInlineBase
{
    public bool Execute()
    {
        if (!CPH.TryGetArg("websocketData", out var websocketData))
        {
            return true;
        }
        var json = JsonConvert.SerializeObject(websocketData);
        CPH.LogInfo($"Overlays - Broadcast JSON - Broadcasting {json}");
        CPH.WebsocketBroadcastJson(json);
        return true;
    }
}