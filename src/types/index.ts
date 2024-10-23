import { Client, Collection, Message } from "discord.js";

export type TClient = Client<boolean> & {
  commands: Collection<string, TCommand>;
};

export type TCommand = {
  name: string;
  execute: TExecute;
  prefixRequired: boolean;
  documentation?: TDocumentation;
};

export type TDocumentation = {
  name?: string;
  description: string;
  variants?: {
    usage: string;
    description: string;
  }[];
};

export type TExecute = ({
  client,
  message,
  args,
}: {
  client: TClient;
  message: Message;
  args: string[];
}) => Promise<void>;

export interface IUser {
  id: string;
  userId: string;
  avatar: string;
  name: string;
  totalMessageCount: number;
  aggregations: IAggregations[];
  userWrapped: IUserWrapped;
}

export type TUserWithoutWrapped = Omit<IUser, "userWrapped">;

export interface IUserWrapped {
  id: string;
  userId: string;
  user: IUser;
  statAggregation: IStatAggregation;
  essaAggregation: IEssa[];
  commandAggregation: ICommandAggregation[];
}

export interface IStatAggregation {
  id: string;
  reactionCount: number;
  attachmentCount: number;
  gifCount: number;
  replyCount: number;
  mentionCount: number;

  userWrappedId: string;
  userWrapped: IUserWrapped;
}

export interface IEssaAggregation {
  id: string;
  createdAt: string;

  date: string;
  essa: number;

  userWrappedId: string;
  userWrapped: IUserWrapped;
}

export interface ICommandAggregation {
  id: string;
  commandName: string;
  usageCount: number;

  userWrappedId: string;
  userWrapped: IUserWrapped;
}

export interface IAggregations {
  id: string;
  dayCount: number;
  date: string;
  userId: string;
}

export interface IEssa {
  ID: number;
  User: string;
  Value: number;
  Description: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IPersonOfTheDay {
  ID: number;
  User: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IJakiJan {
  ID: number;
  User: string;
  JakiJan: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface INotifierItem {
  twitchId: number;
  twitchName: string;
  notifyRoleId: string;
}
