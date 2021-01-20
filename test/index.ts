import env from "./env";
import { Command, CommandClient, SubCommand } from "../src";
import { Interaction } from "../src/interaction";

class HelloWorldCommand extends Command {
  constructor() {
    super({
      name: "hello-world",
      description: 'Says "Hello, World!"',
    });
  }
  async run(int: Interaction) {
    await int.say("Say, how are you doing");
  }
}

class AllArgumentsCommand extends Command {
  constructor() {
    super({
      name: "all-arguments",
      description: "Test all the arguments",
      arguments: [
        {
          type: "boolean",
          name: "are-you-hungry",
          description: "Boolean argument",
        },
        {
          type: "channel",
          name: "channel",
          description: "Channel argument",
        },
        {
          type: "integer",
          name: "integer",
          description: "Integer argument",
        },
        {
          type: "role",
          name: "role",
          description: "Role argument",
        },
        {
          name: "string",
          description: "String argument",
        },
        {
          type: "user",
          name: "user",
          description: "User argument",
        },
      ],
    });
  }
  async run(int: Interaction) {
    const args = int.args;
    int.say("Recieved arguments: " + args.join(", "));
  }
}

class GitCommand extends Command {
  constructor() {
    super({
      name: "git",
      description: "Git related commands",
      subcommands: [new GitAddCommand(), new GitCommitCommand()],
    });
  }
}

class GitAddCommand extends SubCommand {
  constructor() {
    super({
      name: "add",
      description: "Git Add subcommand",
      arguments: [
        {
          name: "file",
          description: "filename",
          type: "string",
        },
      ],
    });
  }

  async run(int: Interaction) {
    int.say("Args: " + int.args.join(", "));
  }
}

class GitCommitCommand extends SubCommand {
  constructor() {
    super({
      name: "commit",
      description: "Git Commit subcommand",
    });
  }

  async run(int: Interaction) {}
}

class BreakingCommand extends Command {
  constructor() {
    super({
      name: "breaking-command",
      description: "A command that tries to break the api",
      subcommands: Array(10)
        .fill(null)
        .map((x, i) => new BreakingRecursiveCommand(`recursive-${i}`, 0)),
    });
  }
}

class BreakingRecursiveCommand extends SubCommand {
  constructor(name: string, depth: number) {
    super({
      name,
      description: "Recursive depth " + depth,
      subcommands:
        depth === 0
          ? undefined
          : [new BreakingRecursiveCommand(`${name}-${depth - 1}`, depth - 1)],
    });
  }
  async run() {}
}

const client = new CommandClient({
  owner: env.owner,
  guild: env.guild,
  token: env.token,
});

client.registry.registerCommands([
  new BreakingCommand(),
  new AllArgumentsCommand(),
  new HelloWorldCommand(),
  new GitCommand(),
]);

client.start();
