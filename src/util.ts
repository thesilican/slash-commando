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
    if (!compareObjects(names1, names2)) {
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
        !compareObjects(opt1.choices, opt2.choices)
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

function compareObjects(a: any, b: any): boolean {
  // Generic compare to objects
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === "string" || typeof b === "string") {
    return compareStrings(a, b);
  }
  if (typeof a === "number" || typeof b === "number") {
    return a === b;
  }
  if (a === undefined || b === undefined) {
    return a === b;
  }
  if (a === null || b === null) {
    return a === b;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!compareObjects(a[i], b[i])) {
        return false;
      }
    }
  }

  if (typeof a !== "object" || typeof b !== "object") {
    throw new Error("Expected type object");
  }
  const aKeys = new Set(Object.keys(a));
  const bKeys = new Set(Object.keys(b));
  const abKeys = new Set([...aKeys.values(), ...bKeys.values()]);
  for (const key in abKeys) {
    if (!aKeys.has(key)) {
      return false;
    }
    if (!bKeys.has(key)) {
      return false;
    }
    if (!compareObjects(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

export interface Serializable<S> {
  serialize(): S;
}
