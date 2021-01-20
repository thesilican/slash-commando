import { APIApplicationCommandCreateOptions } from "./api";
import { Command } from "./command";
import { Serializable } from "./util";

export class CommandRegistry
  implements Serializable<APIApplicationCommandCreateOptions[]> {
  commands: Command[];
  constructor() {
    this.commands = [];
  }

  registerCommand(command: Command) {
    this.commands.push(command);
    return this;
  }

  registerCommands(commands: Command[]) {
    for (const command of commands) {
      this.registerCommand(command);
    }
  }

  serialize(): APIApplicationCommandCreateOptions[] {
    return this.commands.map((c) => c.serialize());
  }
}
