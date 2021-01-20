import {
  APIApplicationCommandOption,
  APIApplicationCommandOptionType,
} from "./api";
import { BaseCommand } from "./basecommand";
import { Serializable } from "./util";

export class SubCommand
  extends BaseCommand
  implements Serializable<APIApplicationCommandOption> {
  serialize(): APIApplicationCommandOption {
    return {
      type: this.subcommands
        ? APIApplicationCommandOptionType.SUB_COMMAND_GROUP
        : APIApplicationCommandOptionType.SUB_COMMAND,
      name: this.name,
      description: this.description,
      options: this.subcommands
        ? this.subcommands.map((s) => s.serialize())
        : this.arguments?.serialize(),
    };
  }
}
