import type Discord from "discord.js";
import type {
  MessageAdditions,
  MessageOptions,
  StringResolvable,
} from "discord.js";
import { CommandClient } from "./client";

export type InteractionResponseType =
  | "acknowledge"
  | "acknowledge-with-source"
  | "message"
  | "message-with-source";

export type InteractionOptions = {
  id: string;
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
  constructor(options: InteractionOptions) {
    this.id = options.id;
    this.command = options.command;
    this.args = options.args;
    this.guild = options.guild;
    this.channel = options.channel;
    this.member = options.member;
    this.subcommands = options.subcommands;
    this.client = options.client;
  }

  async say(
    message: StringResolvable,
    options?: (MessageOptions & { split?: false }) | MessageAdditions
  ): Promise<Discord.Message> {
    if (options) {
      return this.channel.send(message, options);
    } else {
      return this.channel.send(message);
    }
  }
}
