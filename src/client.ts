import Discord, { TextChannel } from "discord.js";
import {
  APIApplicationCommand,
  APIApplicationCommandCreateOptions,
  APIApplicationCommandInteractionDataOption,
  APIInteraction,
  APIInteractionResponseType,
  APIInteractionType,
} from "./api";
import { CommandRegistry } from "./commandregistry";
import { Interaction } from "./interaction";
import { compareCommands } from "./util";

export type CommandClientOptions = Discord.ClientOptions & {
  owner: string;
  token: string;
  guild: string;
};

export type CommandClientStartOptions = {
  noReconcileCommands?: boolean;
};

export class CommandClient extends Discord.Client {
  public readonly owner: string;
  public readonly guildId: string;
  public readonly registry: CommandRegistry;
  constructor(options: CommandClientOptions) {
    super(options);
    this.owner = options.owner;
    this.token = options.token;
    this.guildId = options.guild;
    this.registry = new CommandRegistry();
    this.on("ready", this.onReady.bind(this));
  }

  public async start(options?: CommandClientStartOptions) {
    await this.login();
    if (!this.user) {
      console.error("Unable to log in with token");
      this.stop();
      return;
    }

    if (!(options?.noReconcileCommands ?? false)) {
      try {
        await this.reconcileCommands();
      } catch (err) {
        console.error(
          `There was a problem creating the commands via discord API:\n${err.message}\nPath: ${err.method} ${err.path}`
        );
        this.stop();
        return;
      }
    }

    // Undocumented API
    // @ts-ignore
    this.ws.on("INTERACTION_CREATE", this.onInteraction.bind(this));
  }

  public async reconcileCommands() {
    const appId = (await this.fetchApplication()).id;
    const guildId = this.guildId;
    // Undocumented API
    const endpoint = () =>
      // @ts-ignore
      this.api
        // @ts-ignore
        .applications(appId)
        .guilds(guildId).commands;

    let createList: APIApplicationCommandCreateOptions[] = [];
    let editList: [string, APIApplicationCommandCreateOptions][] = [];
    let deleteList: [string, string][] = [];
    let commandIds: Map<string, string> = new Map();

    // Fetch local and server commands
    const currentCommands = this.registry.serialize();
    const previousCommands: APIApplicationCommand[] = await endpoint().get();

    // Find diffs
    for (const prevCommand of previousCommands) {
      commandIds.set(prevCommand.name, prevCommand.id);
      const curCommand = currentCommands.find(
        (c) => c.name === prevCommand.name
      );
      if (curCommand === undefined) {
        deleteList.push([prevCommand.id, prevCommand.name]);
        continue;
      }
      if (!compareCommands(prevCommand, curCommand)) {
        editList.push([prevCommand.id, curCommand]);
      }
    }
    for (const curCommand of currentCommands) {
      const prevCommand = previousCommands.find(
        (c) => c.name === curCommand.name
      );
      if (!prevCommand) {
        createList.push(curCommand);
      }
    }

    // Apply diffs
    if (createList.length) {
      console.log("Creating", createList.length, "commands");
      for (const command of createList) {
        console.log(`  Creating ${command.name}`);
        const { id } = await endpoint().post({ data: command });
        commandIds.set(command.name, id);
      }
    }
    if (editList.length) {
      console.log("Editing", editList.length, "commands");
      for (const [id, command] of editList) {
        console.log(`  Editing ${command.name}`);
        // For some reason PATCH didn't work properly
        // await endpoint()[id].patch({ data: command });
        await endpoint()[id].delete();
        await endpoint().post({ data: command });
      }
    }
    if (deleteList.length) {
      console.log("Deleting", deleteList.length, "commands");
      for (const [id, name] of deleteList) {
        console.log(`  Deleting ${name}`);
        await endpoint()[id].delete();
      }
    }

    // Add command names
    for (const command of this.registry.commands) {
      const id = commandIds.get(command.name);
      if (id === undefined) {
        throw new Error("Command " + command.name + " has no id");
      }
      command.setId(id);
    }

    console.log("All commands up to date");
  }

  public async stop() {
    console.log("Shutting down bot...");
    this.destroy();
  }

  private onReady() {
    console.log("Logged in as", this.user?.tag);
  }

  private async onInteraction(apiInt: APIInteraction) {
    const { id, token } = apiInt;
    // Undocumented API
    const interactions = () =>
      // @ts-ignore
      this.api.interactions[id][token].callback;

    // Reply to interaction right away
    if (apiInt.type === APIInteractionType.Ping) {
      await interactions().post({
        data: {
          type: APIInteractionResponseType.Pong,
        },
      });
      return;
    } else if (apiInt.type === APIInteractionType.ApplicationCommand) {
      await interactions().post({
        data: {
          type: APIInteractionResponseType.ChannelMessageWithSource,
          data: {
            // Braille empty character
            content: "⠀",
          },
        },
      });
    }

    // Parse args and subcommands
    let args: string[] = [];
    let subcommands: string[] = [];
    let options: APIApplicationCommandInteractionDataOption[] | undefined =
      apiInt.data?.options === undefined
        ? undefined
        : Array.isArray(apiInt.data?.options)
        ? apiInt.data.options
        : [apiInt.data.options];
    while (options !== undefined) {
      args = options.map((x) => x.value!);
      subcommands.push(options[0].name);
      options = options[0].options;
    }

    // Create interaction object
    let guild =
      this.guilds.resolve(apiInt.guild_id) ??
      (await this.guilds.fetch(apiInt.guild_id));
    let channel = (this.channels.resolve(apiInt.channel_id) ??
      (await this.channels.fetch(apiInt.channel_id))) as TextChannel;
    let member =
      guild.members.resolve(apiInt.member.user.id) ??
      (await guild.members.fetch(apiInt.member.user.id));

    const int = new Interaction({
      id: apiInt.id,
      command: {
        id: apiInt.data!.id,
        name: apiInt.data!.name,
      },
      args,
      subcommands,
      member,
      guild,
      channel,
      client: this,
    });

    // Pass interaction to appropriate command
    let found = false;
    for (const command of this.registry.commands) {
      if (command.id === apiInt.data!.id) {
        try {
          await command.execute(int);
        } catch (err) {
          console.error(
            `There was an error while executing ${command.name}:`,
            err
          );
        }
        found = true;
        break;
      }
    }
    if (!found) {
      console.error(
        "Unable to find command with id " +
          apiInt.data!.id +
          " to resolve interaction"
      );
    }
  }
}
