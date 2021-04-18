import Discord, { MessageEmbed } from "discord.js";
import { CommandClient } from "./client";

export type InteractionResponseType =
  | "acknowledge"
  | "acknowledge-with-source"
  | "message"
  | "message-with-source";

export type InteractionOptions = {
  id: string;
  token: string;
  command: {
    name: string;
    id: string;
  };
  args: string[];
  subcommands: string[];
  client: CommandClient;
  guild: Discord.Guild;
  channel: Discord.TextChannel;
  member: Discord.GuildMember;
};

export type InteractionReplyOptions = {
  eatUserInput: boolean;
  embed?: Discord.MessageEmbed | Discord.MessageEmbed[];
};

export class Interaction {
  id: string;
  private token: string;
  command: {
    name: string;
    id: string;
  };
  subcommands: string[];
  args: string[];
  client: CommandClient;
  guild: Discord.Guild;
  channel: Discord.TextChannel;
  member: Discord.GuildMember;
  responded: boolean;
  constructor(options: InteractionOptions) {
    this.id = options.id;
    this.token = options.token;
    this.command = options.command;
    this.args = options.args;
    this.guild = options.guild;
    this.channel = options.channel;
    this.member = options.member;
    this.subcommands = options.subcommands;
    this.client = options.client;
    this.responded = false;
  }

  async say(
    message: string,
    additions?: MessageEmbed | MessageEmbed[]
  ): Promise<Discord.Message> {
    if (!this.responded) {
      this.responded = true;
      const appId = (await this.client.fetchApplication()).id;
      if (!(additions === undefined) && !Array.isArray(additions)) {
        additions = [additions];
      }
      // @ts-ignore
      const res = await this.client.api.webhooks[appId][this.token].messages[
        "@original"
      ].patch({
        data: {
          content: `${message}`,
          embeds: additions?.map((x) => x.toJSON()),
        },
      });
      const id = res.id;
      return this.channel.messages.fetch(id);
    } else {
      if (additions) {
        return this.channel.send(message, additions);
      } else {
        return this.channel.send(message);
      }
    }
  }
}
