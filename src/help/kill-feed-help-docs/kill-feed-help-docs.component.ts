import {Component, computed, Signal, signal} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {ContentUrlComponent} from '../content-url/content-url.component';
import {RouterLink} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {KeyValuePipe} from '@angular/common';

interface Column extends Record<string, string> {
  name: string;
  description: string;
  defaultValue: string;
}

@Component({
  selector: 'app-kill-feed-help-docs',
  templateUrl: './kill-feed-help-docs.component.html',
  styleUrl: './kill-feed-help-docs.component.scss',
  imports: [MatListModule, MatExpansionModule, MatButtonModule, ContentUrlComponent, RouterLink, MatTableModule, KeyValuePipe]
})
export class KillFeedHelpDocsComponent {
  public readonly columns: Signal<Column> = signal({
    name: 'Name',
    description: 'Description',
    defaultValue: 'Default Value'
  });
  public readonly columnHeaders = computed(() => Object.keys(this.columns()));
  public readonly variables: Signal<Column[]> = signal([{
    name: 'discordWebhook',
    description: 'Discord Webhook URL',
    defaultValue: '<blank>'
  },{
    name: 'discordWebhookScKill',
    description: 'Discord Webhook URL when triggered by a kill event in Star Citizen. This is only needed if you intend Kill clips to be sent to a different channel than clips generated via !clip command',
    defaultValue: '%discordWebhook%'
  }, {
    name: 'discordWebhookAvatar',
    description: 'Image URL to show as avatar in Discord message. If blank or not set, the default avatar configured in Discord will be used.',
    defaultValue: '<blank>'
  }, {
    name: 'discordWebhookAvatarScKill',
    description: 'Image URL to show as avatar in Discord message when triggered by a kill event in Star Citizen',
    defaultValue: '%discordWebhookAvatar%'
  }, {
    name: 'discordWebhookUsername',
    description: 'Username to show in Discord message. If blank or not set, the default username configured in Discord will be used.',
    defaultValue: '<blank>'
  }, {
    name: 'discordWebhookUsernameScKill',
    description: 'Username to show in Discord message when triggered by a kill event in Star Citizen',
    defaultValue: '%discordWebhookUsername%'
  }, {
    name: 'scClipKills',
    description: 'Whether clips should be generated for kills in Star Citizen',
    defaultValue: 'true'
  }, {
    name: 'scGameMode',
    description: 'Active game mode detected in Star Citizen. This is set automatically by Streamerbot',
    defaultValue: '<blank>'
  }, {
    name: 'scHandle',
    description: 'Player name detected in Star Citizen. This is set automatically by Streamerbot',
    defaultValue: '<blank>'
  }, {
    name: 'SCTOOLS_API_KEY',
    description: 'API Key to use for sending events to SCTools. This can be generated via SCTools.',
    defaultValue: '<blank>'
  }, {
    name: 'starCitizenKillMessage',
    description: 'Chat message to send when a kill is detected in Star Citizen. Message is sent to both Twitch and Discord. You can reference any available variable in your message.',
    defaultValue: '<blank>'
  }, {
    name: 'twitchClipDelay',
    description: 'Delay in seconds to wait before generating a clip.',
    defaultValue: '10'
  }, {
    name: 'twitchClipMessage',
    description: 'Chat message to send to both discord and twitch. You can reference any available variable in your message.',
    defaultValue: '<blank>'
  }, {
    name: 'twitchClipWaitForClip',
    description: 'Determines whether Streamerbot should generate clips before or after processing kill events.',
    defaultValue: 'true'
  }
  ]);
}
