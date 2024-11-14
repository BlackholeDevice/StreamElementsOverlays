using System.Security.Cryptography;
using System.Text;
using Streamer.bot.Plugin.Interface;

public class IsDuplicateEvent : CPHInlineBase
{
    public bool Execute()
    {
        var eventHash = HashEvent((args["event"] as string)!);
        var exists = CPH.GetGlobalVar<bool>(eventHash, false);
        CPH.SetGlobalVar(eventHash, true, false);
        CPH.SetArgument("duplicate", exists);
        return true;
    }

    private static string HashEvent(string text)
    {
        var md5 = MD5.Create();
        var inputBytes = Encoding.UTF8.GetBytes(text);
        var hashBytes = md5.ComputeHash(inputBytes);
        var sb = new StringBuilder();
        foreach (var t in hashBytes)
        {
            sb.Append(t.ToString("X2"));
        }
        return sb.ToString();
    }
}