import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Command } from 'nestjs-telegraf';
import {
  confirmationKeyInRu,
  confirmationKeyInUz,
  keyboardLan,
  menuInRu,
  menuInUz,
} from 'src/keyboard';
import { Application } from 'src/schema/application.schema';
import { Users } from 'src/schema/users.schema';
import { Context } from 'telegraf';

@Injectable()
export class BotCommands {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
    @InjectModel(Application.name)
    private readonly appModel: Model<Application>,
  ) {}
  async startCommand(ctx: Context) {
    const userId = ctx.message?.from?.id;
    const user = ctx.message.from;

    await ctx.reply(`Salom! ${ctx.from.first_name}`, keyboardLan);

    const currentUser = await this.userModel.findOne({ telegram_id: userId });
    if (!currentUser) {
      const newUser = {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        telegram_id: user.id,
      };
      await this.userModel.create(newUser);
    }
  }

  // conversationForTaxi
  // stpe 1
  async startStep(ctx: Context, user: Users) {
    try {
      if (user.chat_language === 'uz') {
        await ctx.reply(`Ma'lumotlarni aniq to'ldiring❗️`);
        await ctx.reply(`To'liq ismingizni kiriting:`);
      } else if (user.chat_language === 'ru') {
        await ctx.reply(`Заполняйте информацию точно❗️`);
        await ctx.reply(`Введите свое полное имя:`);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //step 2
  async addFullName(ctx: Context, user) {
    try {
      const message = ctx.text;
      await this.appModel.create({
        userId: user._id,
        full_name: message,
      });

      if (user.chat_language === 'uz') {
        await ctx.reply('Joriy manzilingizni lokatsiya shaklida yuboring📍');
      }
      if (user.chat_language === 'ru') {
        await ctx.reply(
          'Отправьте ваш текущий адрес в качестве местоположения📍',
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //step 3
  async addCurrentAddress(ctx: Context, user: any, app: any) {
    try {
      let message = ctx.text;
      const location = ctx.message as any;
      if (location) {
        const { latitude, longitude } = location.location;
        await this.appModel.updateOne(
          { _id: app._id },
          {
            currnet_address: `https://yandex.uz/maps/?pt=${longitude},${latitude}&z=16&l=map`,
          },
        );
        // console.log(
        //   `https://yandex.uz/maps/?pt=${longitude},${latitude}&z=16&l=map`,
        // );
        message = undefined;
      } else if (message) {
        await this.appModel.updateOne(
          { _id: app._id },
          {
            currnet_address: message,
          },
        );
      }

      if (user.chat_language === 'uz') {
        await ctx.reply('Hozirda ishlayotgan telfon raqamingizni yuboring📞');
      }
      if (user.chat_language === 'ru') {
        await ctx.reply('Отправьте свой текущий рабочий номер телефона📞');
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //step 4
  async addPhoneNumber(ctx: Context, user: any, app: any) {
    try {
      const message = ctx.text;
      await this.appModel.updateOne(
        { _id: app._id },
        { phone_number: message },
      );

      if (user.chat_language === 'uz') {
        await ctx.reply('Borish manzilini yuboring📍');
      } else if (user.chat_language === 'ru') {
        await ctx.reply('Отправить адрес назначения📍');
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //step 5
  async addAddress(ctx: Context, user: any, app: any) {
    try {
      const message = ctx.text;
      await this.appModel.updateOne({ _id: app._id }, { where: message });
      if (user.chat_language === 'uz') {
        await ctx.reply(`Jo'nash vaqtini yuboring⏰`);
      } else if (user.chat_language === 'ru') {
        await ctx.reply('Отправьте время отправления⏰');
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // step 6
  async addDeparture(ctx: Context, user: any, app: any) {
    try {
      const message = ctx.text;
      await this.appModel.updateOne(
        { _id: app._id },
        { departure_time: message },
      );
      const currentApp = await this.appModel.findOne({ _id: app._id });
      if (user.chat_language === 'uz') {
        const sendMessage = await ctx.reply(
          `
To'liq ismi: ${currentApp.full_name}
Joriy manzil: ${currentApp.currnet_address}
Telfon raqam: ${currentApp.phone_number}
Borish manzili: ${currentApp.where}
Ketish vaqti: ${currentApp.departure_time}
Qo'shimcha:
  Telegram username: @${user.username || ''}


Ma'lumotlar to'g'riligini tasdiqlang va u haydovchiga yuboriladi!
          `,
          confirmationKeyInUz,
        );
        await this.appModel.updateOne(
          { _id: app._id },
          { message_id: sendMessage.message_id },
        );
      } else if (user.chat_language === 'ru') {
        const sendMessage = await ctx.reply(
          `
Полное имя: ${currentApp.full_name}
Текущий адрес: ${currentApp.currnet_address}
Номер телефона: ${currentApp.phone_number}
Место назначения: ${currentApp.where}
Время отправления: ${currentApp.departure_time}
Дополнительно:
  Телеграм username: ${user.username || ''}


Подтвердите правильность информации, и она будет отправлена ​​водителю!
          `,
          confirmationKeyInRu,
        );
        await this.appModel.updateOne(
          { _id: app._id },
          { message_id: sendMessage.message_id },
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  //send group
  @Command('send')
  async sendGroup(ctx: Context) {
    try {
      const user = await this.userModel.findOne({
        telegram_id: ctx.from.id,
      });

      const currentApps = await this.appModel.find({ userId: user._id });
      const currentApp = currentApps.pop();
      if (user.chat_language === 'uz') {
        await ctx.telegram.sendMessage(
          process.env.GROUP_ID,
          `
To'liq ismi: ${currentApp.full_name}
Joriy manzil: ${currentApp.currnet_address}
Telfon raqam: ${currentApp.phone_number}
Borish manzili: ${currentApp.where}
Ketish vaqti: ${currentApp.departure_time}
Qo'shimcha:
  Telegram username: @${user.username || ''}
          `,
        );
        await ctx.reply(
          `Xabar haydovchilarga yuborildi tez orada hadovchilarda biri siz bilan bog'lanadi!`,
          menuInUz,
        );
        await ctx.telegram.deleteMessage(ctx.chat.id, currentApp.message_id);
      } else if (user.chat_language === 'ru') {
        await ctx.telegram.sendMessage(
          process.env.GROUP_ID,
          `
Полное имя: ${currentApp.full_name}
Текущий адрес: ${currentApp.currnet_address}
Номер телефона: ${currentApp.phone_number}
Место назначения: ${currentApp.where}
Время отправления: ${currentApp.departure_time}
Дополнительно:
  Телеграм username: ${user.username || ''}
          `,
        );
        await ctx.reply(
          'Сообщение отправлено водителям, один из водителей свяжется с вами в ближайшее время!',
          menuInRu,
        );
        await ctx.telegram.deleteMessage(ctx.chat.id, currentApp.message_id);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  async dismiss(ctx: Context) {
    try {
      const user = await this.userModel.findOne({
        telegram_id: ctx.from.id,
      });

      const currentApps = await this.appModel.find({ userId: user._id });
      const currentApp = currentApps.pop();
      await this.appModel.deleteOne({ _id: currentApp._id });
      await ctx.telegram.deleteMessage(ctx.chat.id, currentApp.message_id);
      if (user.chat_language === 'uz') {
        await ctx.reply(`Muvaffaqiyatli o'chirildi🗑`, menuInUz);
      } else if (user.chat_language === 'ru') {
        await ctx.reply(`Успешно удалено🗑`, menuInRu);
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  // change language
  async changeLanguage(ctx: Context) {
    const user = await this.userModel.findOne({
      telegram_id: ctx.from.id,
    });
    if (user.chat_language === 'uz') {
      await ctx.reply('Выбирать🔂', keyboardLan);
    } else if (user.chat_language === 'ru') {
      await ctx.reply('Tanlang🔂', keyboardLan);
    }
  }
}
