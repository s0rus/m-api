import { Message } from 'discord.js';
import { prisma } from '../../index';
import { discordIds } from '../../constants/discordIds';

export async function ahaAdd(message: Message, args: string[]): Promise<void> {
  const [numer, link] = args;

  if (!numer || !link) {
    await message.reply(
      'Podaj poprawne argumenty: !ahadodaj `numer` `link` <:ostatniaszansa:1078048819075354715>',
    );
    return;
  }

  const urlRegex = /^https:\/\/.*\.gif$/;

  if (!urlRegex.test(link)) {
    await message.reply(
      'Drugi argument powinien być poprawnym adresem URL <:ostatniaszansa:1078048819075354715>',
    );
    return;
  }

  try {
    const user = message.member;
    if (!user) {
      await message.reply('Nie można odczytać informacji o użytkowniku.');
      return;
    }

    if (!user.roles.cache.has(discordIds.ADMIN_ROLE)) {
      await message.reply('Nie masz uprawnień do dodawania aha.');
      return;
    }

    const existingAha = await prisma.ahaGifs.findFirst({
      where: {
        OR: [{ id: numer }, { url: link }],
      },
    });

    if (existingAha) {
      await message.reply(
        'Takie aha już istnieje <:ostrzezenie:1108028955220512838>',
      );
      return;
    }

    await prisma.ahaGifs.create({
      data: {
        id: numer,
        url: link,
      },
    });

    await message.reply(
      `Pomyślnie dodano aha${numer} do bazy danych <:Smieszek:1050427251394625586>`,
    );
  } catch (error) {
    console.error(
      `Wystąpił błąd podczas dodawania aha${numer} <:ostrzezenie:1108028955220512838>`,
      error,
    );
    await message.reply(
      `Wystąpił błąd podczas dodawania aha${numer} <:ostrzezenie:1108028955220512838>`,
    );
  }
}

export async function ahaRemove(
  message: Message,
  args: string[],
): Promise<void> {
  const [numer] = args;

  if (!numer) {
    await message.reply(
      'Podaj poprawny argument: `numer` do usunięcia aha <:ostatniaszansa:1078048819075354715>',
    );
    return;
  }

  try {
    const user = message.member;
    if (!user) {
      await message.reply('Nie można odczytać informacji o użytkowniku.');
      return;
    }

    if (!user.roles.cache.has(discordIds.ADMIN_ROLE)) {
      await message.reply('Nie masz uprawnień do usuwania aha.');
      return;
    }

    const deletedAha = await prisma.ahaGifs.deleteMany({
      where: {
        id: numer,
      },
    });

    if (deletedAha.count === 0) {
      await message.reply(
        `Nie znaleziono aha${numer} do usunięcia <:ostrzezenie:1108028955220512838>`,
      );
      return;
    }

    await message.reply(
      `Pomyślnie usunięto aha${numer} z bazy danych <:Smieszek:1050427251394625586>`,
    );
  } catch (error) {
    console.error(
      `Wystąpił błąd podczas usuwania aha${numer} <:ostrzezenie:1108028955220512838>`,
      error,
    );
    await message.reply(
      `Wystąpił błąd podczas usuwania aha${numer} <:ostrzezenie:1108028955220512838>`,
    );
  }
}

export async function ahaList(message: Message): Promise<void> {
  try {
    const ahaList = await prisma.ahaGifs.findMany({
      select: {
        id: true,
      },
    });

    if (ahaList.length === 0) {
      await message.reply(
        'Brak dostępnych aha <:ostrzezenie:1108028955220512838>',
      );
      return;
    }

    const ahaNumbers = ahaList.map((aha) => aha.id).join(', ');
    await message.reply(`Dostępne aha: ${ahaNumbers}`);
  } catch (error) {
    console.error(
      'Wystąpił błąd podczas pobierania listy aha <:ostrzezenie:1108028955220512838>',
      error,
    );
    await message.reply(
      'Wystąpił błąd podczas pobierania listy aha <:ostrzezenie:1108028955220512838>',
    );
  }
}
export const ahaRandom = async (message: Message) => {
  try {
    const ahaGifs = await prisma.ahaGifs.findMany();

    if (ahaGifs.length === 0) {
      console.log('Nie znaleziono żadnych pozycji aha');
      return;
    }

    const randomIndex = Math.floor(Math.random() * ahaGifs.length);
    const randomAha = ahaGifs[randomIndex].url;
    message.channel.send(randomAha);
  } catch (error) {
    console.error('Wystąpił błąd podczas losowania aha', error);
  }
};
