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
  id: string;
  essa: number;
  quote: string;
}
