using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ScKills : CPHInlineBase
{
    private const string Action = "SC Kills";

    public bool Execute()
    {
        if (YouAreNotAttacker())
        {
            Log("You aren't the attacker. Skipping kill hooks");
            return true;
        }

        if (PlayerKilledThemselves())
        {
            Log("You killed yourself. Skipping kill hooks");
            return true;
        }

        if (VictimIsAnNpc())
        {
            Log("The victim is an NPC. Skipping kill hooks.");
            return true;
        }

        RunPlayerKillHooks();
        NotifyScTools();
        return true;
    }

    private void NotifyScTools()
    {
        CPH.RunActionById("fe2893af-ee1f-414b-b1a9-f4c015b32a9c");
    }

    private bool VictimIsAnNpc()
    {
        return CPH.TryGetArg("victimIsNpc", out bool victimIsNpc) && victimIsNpc;
    }

    private bool PlayerKilledThemselves()
    {
        return args["attacker"].ToString() == args["victim"].ToString();
    }

    private bool YouAreNotAttacker()
    {
        return args["attacker"].ToString() != args["handle"].ToString();
    }

    private void RunPlayerKillHooks()
    {
        Log("Running custom kill hooks");
        CPH.RunActionById("89d93224-b243-4164-ae7e-a823ed5899f0");
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}