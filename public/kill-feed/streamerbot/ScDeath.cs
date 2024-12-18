using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ScDeath : CPHInlineBase
{
    private const string Action = "Star Citizen - Hooks - Deaths";

    public bool Execute()
    {
        if (!YouDied())
        {
            Log("You didn't die. Skipping death hooks.");
            return true;
        }

        RunYouDied();
        if (YouKilledYourself())
        {
            Log("Ya played yaself. Skipping non-suicide hooks.");
            return true;
        }

        RunDiedButDidntKillYourself();

        return true;
    }

    private bool YouKilledYourself()
    {
        return args["deathType"].ToString() == "Suicide";
    }

    private bool YouDied()
    {
        IList<string> deathTypes = new List<string> { "Death", "Suicide" };
        return deathTypes.Contains(args["deathType"].ToString()!);
    }

    private void RunYouDied()
    {
        Log("Running custom death hooks");
        CPH.RunActionById("978cdd4b-c130-4df6-9fc0-27e90ac5a9fe");
    }

    private void RunDiedButDidntKillYourself()
    {
        Log("Running custom hooks for deaths that weren't suicides");
        CPH.RunActionById("3a86a544-00ce-4296-8926-923cbf138eb0");
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }
}