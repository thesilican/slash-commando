export type APIApplicationCommand = {
  id: string;
  application_id: string;
  name: string;
  description: string;
  options?: APIApplicationCommandOption[];
};

export type APIApplicationCommandCreateOptions = {
  name: string;
  description: string;
  options?: APIApplicationCommandOption[];
};

export type APIApplicationCommandOption = {
  type: APIApplicationCommandOptionType;
  name: string;
  description: string;
  default?: boolean;
  required?: boolean;
  choices?: APIApplicationCommandOptionChoice[];
  options?: APIApplicationCommandOption[];
};

export enum APIApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}

export type APIApplicationCommandOptionChoice = {
  name: string;
  value: string | number;
};

export type APIInteraction = {
  id: string;
  type: APIInteractionType;
  data?: APIApplicationCommandInteractionData;
  guild_id: string;
  channel_id: string;
  member: { user: { id: string } };
  token: string;
  version: 1;
};

export enum APIInteractionType {
  Ping = 1,
  ApplicationCommand = 2,
}

export type APIApplicationCommandInteractionData = {
  id: string;
  name: string;
  options?: APIApplicationCommandInteractionDataOption;
};

export type APIApplicationCommandInteractionDataOption = {
  name: string;
  value?: string;
  options?: APIApplicationCommandInteractionDataOption[];
};

export type APIInteractionResponse = {
  type: APIInteractionResponseType;
  data?: APIInteractionApplicationCommandCallbackData;
};

export enum APIInteractionResponseType {
  Pong = 1,
  Acknowledge = 2,
  ChannelMessage = 3,
  ChannelMessageWithSource = 4,
  AcknowledgeWithSource = 5,
}

export type APIInteractionApplicationCommandCallbackData = {
  tts?: boolean;
  content: string;
  embeds?: object[];
  allowed_mentions?: object;
};
