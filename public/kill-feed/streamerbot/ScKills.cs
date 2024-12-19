using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ScKills : CPHInlineBase
{
    private const string Action = "Star Citizen - Hooks - Kills";

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

        var waitForClip = ShouldWaitForClipGeneration();

        if (!waitForClip)
        {
            RunPlayerKillHooks();
        }
        
        CreateClipIfNotExists();
        if (waitForClip)
        {
            RunPlayerKillHooks();
        }

        NotifyScTools();
        return true;
    }
    
    private void CreateClipIfNotExists()
    {
        if (args.ContainsKey("createClipUrl") || !ShouldClipKills())
        {
            return;
        }

        Log("No clip exists yet. Attempting to create one.");
        CPH.RunActionById("3eab67b8-3d37-4d30-8924-e3cfe082e4c8");
    }

    private bool ShouldClipKills()
    {
        return CheckGlobalBool("scClipKills");
    }

    private bool ShouldWaitForClipGeneration()
    {
        return CheckGlobalBool("twitchClipWaitForClip");
    }

    private bool CheckGlobalBool(string global, bool defaultValue = true)
    {
        var value = CPH.GetGlobalVar<string>(global);
        if (string.IsNullOrWhiteSpace(value))
        {
            value = defaultValue.ToString();
        }
        
        return bool.Parse(value);
    }

    private void NotifyScTools()
    {
        CPH.RunActionById("287bfdc7-a2c9-479a-8623-c8be7cb9a2e8");
    }

    private bool VictimIsAnNpc()
    {
        return CPH.TryGetArg("victimIsNpc", out bool victimIsNpc) && victimIsNpc;
    }

    private bool PlayerKilledThemselves()
    {
        return args["deathType"].ToString() == "Suicide";
    }

    private bool YouAreNotAttacker()
    {
        return args["deathType"].ToString() != "Kill";
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