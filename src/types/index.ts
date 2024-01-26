import { Client, Collection, Message } from 'discord.js';

export type TClient = Client<boolean> & {
  commands: Collection<string, TCommand>;
};

export type TCommand = {
  name: string;
  execute: TExecute;
  prefixRequired: boolean;
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
