﻿using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using Streamer.bot.Plugin.Interface;

namespace StreamerBot;

public class ScToolsSendEvent : CPHInlineBase
{
    private const string Api = "https://starcitizentool.com/api/v1";
    private const string Action = "SCTools - Send Event";

    public bool Execute()
    {
        if (VictimIsAnNpc() || YouArentTheAttacker() || YouKilledYourself())
        {
            Log("You either aren't the attacker, killed yourself, or the victim was an NPC. Skipping SC Tools event");
            return true;
        }

        if (!HasGameMode())
        {
            Log("Missing game mode. Skipping SC Tools event");
            return true;
        }

        PostEventToScTool();
        return true;
    }

    private bool HasGameMode()
    {
        return CPH.TryGetArg("gamerules", out string gameMode) && !string.IsNullOrWhiteSpace(gameMode);
    }

    private void PostEventToScTool()
    {
        var jsonString = JsonConvert.SerializeObject(new Kill(args));
        Log($"Posting the following JSON to SCTool: {jsonString}");
        if (CPH.GetGlobalVar<bool>("SCTOOLS_DRY_RUN"))
        {
            Log("Dry run mode, pretending to send.");
            return;
        }

        using var httpClient = new HttpClient();
        var apiKey = CPH.GetGlobalVar<string>("SCTOOLS_API_KEY");
        httpClient.DefaultRequestHeaders.Add("X-Api-Key", apiKey);

        var jsonContent = new StringContent(jsonString, Encoding.UTF8, "application/json");

        var response = httpClient.PostAsync($"{Api}/kills", jsonContent).Result;
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        Log(jsonString);
        CPH.ShowToastNotification("SCTools", $"Failed to call SCTools API: HTTP ${response.StatusCode}");
    }

    private bool YouKilledYourself()
    {
        return args["deathType"].ToString() == "Suicide";
    }

    private bool YouArentTheAttacker()
    {
        return args["deathType"].ToString() != "Kill";
    }

    private bool VictimIsAnNpc()
    {
        return CPH.TryGetArg("victimIsNpc", out bool victimIsNpc) && victimIsNpc;
    }

    private void Log(string message)
    {
        CPH.LogInfo($"{Action} - {message}");
    }

    private class Kill
    {
        public Kill(Dictionary<string, object> args)
        {
            Args = args;
        }

        private Dictionary<string, object> Args { get; }

        private static string? AsString(Dictionary<string, object> data, string field)
        {
            return data.TryGetValue(field, out var value) ? value.ToString()! : null;
        }
        
        [JsonProperty("clip_url")] public string? ClipUrl => AsString(Args, "createClipUrl");
        [JsonProperty("timestamp")] public string? Timestamp => AsString(Args, "timestamp");
        [JsonProperty("game_mode")] public string? GameMode => AsString(Args, "gamerules");
        [JsonProperty("log_line")] public string? LogLine => AsString(Args, "line");
    }
}