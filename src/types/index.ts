import { Client, Collection, Message } from "discord.js";

export type DCClient = Client<boolean> & {
  commands: Collection<string, DiscordCommand>;
};

export type DiscordCommand = {
  name: string;
  execute: CommandProps;
  prefixRequired: boolean;
  documentation?: CommandDocs;
};

export type CommandDocs = {
  name?: string;
  description: string;
  variants?: {
    usage: string;
    description: string;
  }[];
};

export type CommandProps = ({
  client,
  message,
  args,
}: {
  client: DCClient;
  message: Message;
  args: string[];
}) => Promise<void>;

export interface DiscordUser {
  id: string;
  userId: string;
  avatar: string;
  name: string;
  totalMessageCount: number;
  aggregations: Aggregations[];
  userWrapped: UserWrapped;
}

export type DiscordUserWithoutWrapped = Omit<DiscordUser, "userWrapped">;

export interface UserWrapped {
  id: string;
  userId: string;
  user: DiscordUser;
  statAggregation: StatAggregation;
  essaAggregation: Essa[];
  commandAggregation: CommandAggregation[];
}

export interface StatAggregation {
  id: string;
  reactionCount: number;
  attachmentCount: number;
  gifCount: number;
  replyCount: number;
  mentionCount: number;

  userWrappedId: string;
  userWrapped: UserWrapped;
}

export interface EssaAggregation {
  id: string;
  createdAt: string;

  date: string;
  essa: number;

  userWrappedId: string;
  userWrapped: UserWrapped;
}

export interface CommandAggregation {
  id: string;
  commandName: string;
  usageCount: number;

  userWrappedId: string;
  userWrapped: UserWrapped;
}

export interface Aggregations {
  id: string;
  dayCount: number;
  date: string;
  userId: string;
}

export interface Essa {
  discord_id: string;
  essa_value: number;
  value_description: string;
}

export interface PersonOfTheDay {
  discord_id: string;
}

export interface DailyEmote {
  discord_id: string;
  emote: string;
}

export interface StreamNotifierItem {
  twitchId: number;
  twitchName: string;
  notifyRoleId: string;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
