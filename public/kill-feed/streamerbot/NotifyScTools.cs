using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class NotifyScTools : CPHInlineBase
{
    private const string Action = "Notify SC Tools";
    public bool Execute()
    {
        if (VictimIsAnNpc() || YouArentTheAttacker() || YouKilledYourself())
        {
            Log("You either aren't the attacker, killed yourself, or the victim was an NPC. Skipping SC Tools event");
            return true;
        }

        CreateClipIfNotExists();
        SendEventToScTool();
        return true;
    }

    private void SendEventToScTool()
    {
        Log("Attempting to send event to SC Tools");
        CPH.RunActionById("287bfdc7-a2c9-479a-8623-c8be7cb9a2e8");
    }

    private void CreateClipIfNotExists()
    {
        if (IsNotStreaming())
        {
            return;
        }
        if (args.ContainsKey("createClipUrl"))
        {
            return;
        }
        Log("No clip exists yet. Attempting to create one.");
        CPH.RunActionById("3eab67b8-3d37-4d30-8924-e3cfe082e4c8");
    }

    private bool IsNotStreaming()
    {
        return !CPH.ObsIsConnected() || !CPH.ObsIsStreaming();
    }

    private bool YouKilledYourself()
    {
        return args["attacker"].ToString() == args["victim"].ToString();
    }

    private bool YouArentTheAttacker()
    {
        return args["attacker"].ToString() != args["handle"].ToString();
    }

    private bool VictimIsAnNpc()
    {
        return CPH.TryGetArg("victimIsNpc", out bool victimIsNpc) && victimIsNpc;
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}