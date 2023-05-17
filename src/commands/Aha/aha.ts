import { Message } from 'discord.js';
import { z } from 'zod';
import { discordEmotes, discordRoles } from '../../constants/discordIds';
import { hasPermissions } from '../../helpers/hasPermissions';
import { prisma } from '../../index';
import { newAhaSchema, type NewAha } from './ahaSchema';

export const addAha = async (
  message: Message,
  { ahaNumber, ahaUrl }: NewAha,
) => {
  try {
    const parsedNewAha = newAhaSchema.safeParse({
      ahaNumber,
      ahaUrl,
    });

    if (parsedNewAha.success === false) {
      throw new Error(
        `Podaj poprawne argumenty: \`!aha add <numer> <link>\` ${discordEmotes.OSTATNIA_SZANSA}`,
      );
    }

    if (!hasPermissions(message, discordRoles.ADMIN_ROLE)) {
      throw new Error('Nie masz uprawnień do dodawania aha.');
    }

    const existingAha = await prisma.ahaGifs.findFirst({
      where: {
        OR: [{ id: ahaNumber }, { url: ahaUrl }],
      },
    });

    if (existingAha) {
      throw new Error(`Takie aha już istnieje ${discordEmotes.OSTRZEZENIE}`);
    }

    await prisma.ahaGifs.create({
      data: {
        id: ahaNumber,
        url: ahaUrl,
      },
    });

    await message.reply(
      `Pomyślnie dodano aha${ahaNumber} do bazy danych ${discordEmotes.SMIESZEK}`,
    );
  } catch (error) {
    const err = error as Error;
    console.error(err);
    await message.reply(err.message);
  }
};

export const removeAha = async (message: Message, ahaNumber: number) => {
  if (
    !ahaNumber ||
    z.number().int().positive().safeParse(ahaNumber).success === false
  ) {
    throw new Error(
      `Podaj poprawny argument: \`numer\` do usunięcia aha ${discordEmotes.OSTATNIA_SZANSA}`,
    );
  }

  try {
    if (!hasPermissions(message, discordRoles.ADMIN_ROLE)) {
      throw new Error('Nie masz uprawnień do usuwania aha.');
    }

    const deletedAha = await prisma.ahaGifs.deleteMany({
      where: {
        id: ahaNumber,
      },
    });

    if (deletedAha.count === 0) {
      throw new Error(
        `Nie znaleziono aha${ahaNumber} do usunięcia ${discordEmotes.OSTRZEZENIE}`,
      );
    }

    await message.reply(
      `Pomyślnie usunięto aha${ahaNumber} z bazy danych ${discordEmotes.SMIESZEK}`,
    );
  } catch (error) {
    const err = error as Error;
    console.error(error);
    await message.reply(err.message);
  }
};

export const listAha = async (message: Message) => {
  try {
    const gifList = await prisma.ahaGifs.findMany({
      select: {
        id: true,
      },
    });

    if (gifList.length === 0) {
      throw new Error(`Brak dostępnych aha ${discordEmotes.OSTRZEZENIE}`);
    }

    const ahaNumbers = gifList.map((ahaGif) => ahaGif.id).join(', ');
    await message.reply(`Dostępne aha: ${ahaNumbers}`);
  } catch (error) {
    const err = error as Error;
    console.error(error);
    await message.reply(err.message);
  }
};

export const getAha = async (message: Message, ahaNumber: number) => {
  try {
    if (
      !ahaNumber ||
      z.number().int().positive().safeParse(ahaNumber).success === false
    ) {
      throw new Error(
        `Podaj poprawny argument: \`numer\` do wyświetlenia aha ${discordEmotes.OSTATNIA_SZANSA}`,
      );
    }

    const ahaGif = await prisma.ahaGifs.findFirst({
      where: {
        id: ahaNumber,
      },
    });

    if (!ahaGif) {
      throw new Error(
        `Nie znaleziono aha${ahaNumber} ${discordEmotes.OSTRZEZENIE}`,
      );
    }

    await message.channel.send(ahaGif.url);
  } catch (error) {
    const err = error as Error;
    console.error(error);
    await message.reply(err.message);
  }
};

export const getRandomAha = async (message: Message) => {
  try {
    const ahaGifs = await prisma.ahaGifs.findMany();

    if (ahaGifs.length === 0) {
      throw new Error('Nie znaleziono żadnych pozycji aha');
    }

    const randomIndex = Math.floor(Math.random() * ahaGifs.length);
    const randomAha = ahaGifs[randomIndex].url;
    message.channel.send(randomAha);
  } catch (error) {
    const err = error as Error;
    console.error('Wystąpił błąd podczas losowania aha', error);
    await message.reply(err.message);
  }
};
