import {
  APIApplicationCommandOption,
  APIApplicationCommandOptionType,
} from "./api";
import { Serializable } from "./util";

export type ArgumentType =
  | "string"
  | "integer"
  | "boolean"
  | "user"
  | "channel"
  | "role";

export type ArgumentChoice = {
  name: string;
  value: number;
};

export type ArgumentOptions = {
  /**
   * The type of argument.
   * Default: "string"
   */
  type?: ArgumentType;
  name: string;
  description: string;
  default?: boolean;
  required?: boolean;
  choices?: ArgumentChoice[];
};

export class Argument implements Serializable<APIApplicationCommandOption> {
  public readonly type: ArgumentType;
  public readonly name: string;
  public readonly description: string;
  public readonly default: boolean;
  public readonly required: boolean;
  public readonly choices?: ArgumentChoice[];
  constructor(options: ArgumentOptions) {
    this.type = options.type ?? "string";
    this.name = options.name;
    this.description = options.description;
    this.default = options.default ?? false;
    this.required = options.required ?? true;
    this.choices = options.choices;
  }

  serialize(): APIApplicationCommandOption {
    const enumMap: { [s in ArgumentType]: APIApplicationCommandOptionType } = {
      boolean: APIApplicationCommandOptionType.BOOLEAN,
      channel: APIApplicationCommandOptionType.CHANNEL,
      integer: APIApplicationCommandOptionType.INTEGER,
      role: APIApplicationCommandOptionType.ROLE,
      string: APIApplicationCommandOptionType.STRING,
      user: APIApplicationCommandOptionType.USER,
    };
    return {
      type: enumMap[this.type],
      name: this.name,
      description: this.description,
      default: this.default,
      required: this.required,
      choices: this.choices,
    };
  }
}

export type ArgumentListOptions = ArgumentOptions[];

export class ArgumentList
  implements Serializable<APIApplicationCommandOption[]> {
  public readonly arguments: Argument[];
  constructor(options: ArgumentListOptions) {
    this.arguments = options.map((opt) => new Argument(opt));
  }
  serialize(): APIApplicationCommandOption[] {
    return this.arguments.map((a) => a.serialize());
  }
}
