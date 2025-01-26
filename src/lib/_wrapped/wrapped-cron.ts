import { DCClient } from "@/types";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import cron from "node-cron";
import { discordId } from "../constants";
import { logger } from "../utils";
import { DiscordClient } from "../discord-client";

cron.schedule("0 12 1 12 *", async () => {
  const client = DiscordClient.getInstance();
  await notifyAboutWrapped(client);
});

async function notifyAboutWrapped(client: DCClient) {
  const channel = await client.channels.fetch(discordId.MAIN_CHANNEL_ID);

  if (channel && channel.isTextBased()) {
    const wrappedLinkButton = new ButtonBuilder()
      .setLabel("Sprawdź cwrapped")
      .setURL("https://cwrapped.vercel.app")
      .setStyle(ButtonStyle.Link);

    const embed = new EmbedBuilder()
      .setTitle("Cwelostan Wrapped 2024 ✨")
      .setDescription(
        `Cwrapped już jest dostępne! Sprawdź statystyki cwelostanu w tym roku xd`,
      );

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      wrappedLinkButton,
    );

    channel.send({
      content: "@everyone",
      embeds: [embed],
      components: [actionRow],
    });
  } else {
    logger.error("Could not find main channel while notifying about wrapped");
    return;
  }
}
