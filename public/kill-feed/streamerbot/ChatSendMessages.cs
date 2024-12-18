using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ChatSendMessages : CPHInlineBase
{
    public bool Execute()
    {
        ConfigureDiscordWebhook();
        ParseMessage();
        return true;
    }

    private void ConfigureDiscordWebhook()
    {
        CPH.SetArgument("discordWebhookUsername", CPH.GetGlobalVar<string>("discordWebhookUsername"));
        var discordWebhook = CPH.GetGlobalVar<string>("discordWebhook");
        var discordWebhookUsername = CPH.GetGlobalVar<string>("discordWebhookUsername");
        var discordWebhookAvatar = CPH.GetGlobalVar<string>("discordWebhookAvatar");
        if (CPH.TryGetArg("deathType", out string deathType) && deathType == "Kill")
        {
            discordWebhook = CPH.GetGlobalVar<string>("discordWebhookScKill");
            discordWebhookUsername = CPH.GetGlobalVar<string>("discordWebhookUsernameScKill");
            discordWebhookAvatar = CPH.GetGlobalVar<string>("discordWebhookAvatarScKill");
        }
        CPH.SetArgument("discordWebhook", discordWebhook);
        CPH.SetArgument("discordWebhookUsername", ParseTemplates(discordWebhookUsername));
        CPH.SetArgument("discordWebhookAvatar", ParseTemplates(discordWebhookAvatar));
    }

    private void ParseMessage()
    {
        if (!CPH.TryGetArg("message", out string message) || string.IsNullOrWhiteSpace(message))
        {
            return;
        }

        message = ParseTemplates(message);
        CPH.SetArgument("message", message);
    }

    private string ParseTemplates(string template)
    {
        if (string.IsNullOrWhiteSpace(template))
        {
            return template;
        }
        
        foreach (var kvp in args)
        {
            var key = $"%{kvp.Key}%";
            if (template.Contains(key))
            {
                template = template.Replace(key, $"{kvp.Value}");
            }
        }
        return template;
    }
}