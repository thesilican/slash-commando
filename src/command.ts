import { APIApplicationCommandCreateOptions } from "./api";
import { BaseCommand, BaseCommandOptions } from "./basecommand";
import { Interaction } from "./interaction";
import { Serializable } from "./util";

export type CommandOptions = BaseCommandOptions & {};

export class Command
  extends BaseCommand
  implements Serializable<APIApplicationCommandCreateOptions> {
  public id: string;
  constructor(options: CommandOptions) {
    super(options);
    this.id = "";
  }

  setId(id: string) {
    this.id = id;
  }
  serialize(): APIApplicationCommandCreateOptions {
    return {
      name: this.name,
      description: this.description,
      options: this.subcommands
        ? this.subcommands.map((s) => s.serialize())
        : this.arguments?.serialize(),
    };
  }
}
