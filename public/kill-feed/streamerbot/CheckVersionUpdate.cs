using System.Text.RegularExpressions;
using Semver;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

class CheckVersionUpdate : CPHInlineBase
{
    public bool Execute()
    {
        CPH.TryGetArg("remoteVersion", out string remoteVersion);
        remoteVersion ??= "";
        if (!Regex.IsMatch(remoteVersion, @"v?[0-9]((\.[0-9]){1,2})?$"))
        {
            return false;
        }
        remoteVersion = Regex.Replace("^v", "", remoteVersion);
        var remote = SemVersion.Parse(remoteVersion, SemVersionStyles.Any);
        var local = SemVersion.Parse(args["version"] as string, SemVersionStyles.Strict);

        return local.ComparePrecedenceTo(remote) < 0;
    }
}