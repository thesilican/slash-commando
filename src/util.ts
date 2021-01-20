import {
  APIApplicationCommand,
  APIApplicationCommandCreateOptions,
  APIApplicationCommandOption,
  APIApplicationCommandOptionType,
} from "./api";

// TODO: Make it so it better compares two command options
export function compareCommands(
  prevCommand: APIApplicationCommand,
  curCommand: APIApplicationCommandCreateOptions
): boolean {
  if (!compareStrings(prevCommand.name, curCommand.name)) {
    return false;
  }
  if (!compareStrings(prevCommand.description, curCommand.description)) {
    return false;
  }

  return compareOpts(prevCommand.options, curCommand.options);
}

type Options = APIApplicationCommandOption[] | undefined;

function compareOpts(opts1: Options, opts2: Options): boolean {
  if (optionsIsEmpty(opts1) && optionsIsEmpty(opts2)) {
    return true;
  }
  if (optionsIsEmpty(opts1) !== optionsIsEmpty(opts2)) {
    return false;
  }
  // Both not empty, compare properties
  if (opts1!.length !== opts2!.length) {
    return false;
  }
  if (
    opts1![0].type === APIApplicationCommandOptionType.SUB_COMMAND ||
    opts1![0].type === APIApplicationCommandOptionType.SUB_COMMAND_GROUP
  ) {
    // Both are subcommands, compare subcommands
    const names1 = opts1!.map((x) => x.name);
    const names2 = opts2!.map((x) => x.name);
    if (!compareArrays(names1, names2)) {
      return false;
    }
    for (const name of names1) {
      const opt1 = opts1!.find((x) => x.name === name);
      const opt2 = opts2!.find((x) => x.name === name);
      if (opt1 === undefined || opt2 === undefined) {
        // This really should never happen
        return false;
      }
      if (!compareOpts(opt1.options, opt2.options)) {
        return false;
      }
    }
    return true;
  } else {
    // Both are arguments, compare arguments
    for (let i = 0; i < opts1!.length; i++) {
      const opt1 = opts1![i];
      const opt2 = opts2![i];
      if (!compareStrings(opt1.name, opt2.name)) {
        return false;
      }
      if (!compareStrings(opt1.description, opt2.description)) {
        return false;
      }
      // Default value (if undefined) is false (api docs)
      if ((opt1.default ?? false) !== (opt2.default ?? false)) {
        return false;
      }
      // Default value (if undefined) is false (api docs)
      if ((opt1.required ?? false) !== (opt2.required ?? false)) {
        return false;
      }
      if ((opt1.choices === undefined) !== (opt2.choices === undefined)) {
        return false;
      }
      if (
        opt1.choices &&
        opt2.choices &&
        !compareArrays(opt1.choices, opt2.choices)
      ) {
        return false;
      }
    }
    return true;
  }
}

function optionsIsEmpty(options: any[] | undefined): options is undefined | [] {
  return options === undefined || options.length === 0;
}

function compareStrings(str1: string, str2: string) {
  return str1.trim() === str2.trim();
}

function compareArrays<T>(arr1: T[], arr2: T[]) {
  const set1 = new Set<T>(arr1);
  const set2 = new Set<T>(arr2);
  if (set1.size !== set2.size) {
    return false;
  }
  for (const val of set1.keys()) {
    if (!set2.has(val)) {
      return false;
    }
  }
  return true;
}

export interface Serializable<S> {
  serialize(): S;
}
