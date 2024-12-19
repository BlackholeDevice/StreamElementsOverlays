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
        var discordWebhook = DefaultString("discordWebhook");
        var discordWebhookUsername = DefaultString("discordWebhookUsername");
        var discordWebhookAvatar = DefaultString("discordWebhookAvatar");
        if (CPH.TryGetArg("deathType", out string deathType) && deathType == "Kill")
        {
            discordWebhook = DefaultString("discordWebhookScKill", discordWebhook);
            discordWebhookUsername = DefaultString("discordWebhookUsernameScKill", discordWebhookUsername);
            discordWebhookAvatar = DefaultString("discordWebhookAvatarScKill", discordWebhookAvatar);
        }
        CPH.SetArgument("discordWebhook", discordWebhook);
        CPH.SetArgument("discordWebhookUsername", ParseTemplates(discordWebhookUsername));
        CPH.SetArgument("discordWebhookAvatar", ParseTemplates(discordWebhookAvatar));
    }

    private string DefaultString(string key, string defaultValue = "")
    {
        var value = CPH.GetGlobalVar<string>(key);
        return string.IsNullOrWhiteSpace(value) ? defaultValue : value;
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