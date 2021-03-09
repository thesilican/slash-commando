import { ArgumentList, ArgumentOptions } from "./argument";
import { Interaction } from "./interaction";
import { SubCommand } from "./subcommand";

export type BaseCommandOptions = {
  name: string;
  description: string;
  arguments?: ArgumentOptions[];
  subcommands?: SubCommand[];
};

export abstract class BaseCommand {
  public readonly name: string;
  public readonly description: string;
  public readonly arguments?: ArgumentList;
  public readonly subcommands?: SubCommand[];
  constructor(options: BaseCommandOptions) {
    this.name = options.name;
    this.description = options.description;
    if (options.arguments) {
      this.arguments = new ArgumentList(options.arguments);
    }
    this.subcommands = options.subcommands;
  }

  async execute(int: Interaction, depth = 0) {
    if (this.subcommands) {
      const name = int.subcommands[depth];
      if (!name) {
        throw new Error("Interaction created with too few subcommands");
      }
      const subcommand = this.subcommands.find((x) => x.name === name);
      if (!subcommand) {
        throw new Error("Unable to find subcommand " + name);
      }
      await subcommand.execute(int, depth + 1);
    } else {
      await this.run(int);
    }
  }

  async run(int: Interaction): Promise<any> {
    throw new Error(
      "Command not implemented, you must add a 'run' method to your command class"
    );
  }
}
