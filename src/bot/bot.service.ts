import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Action, Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { BotCommands } from 'src/command/bot.command';
import { menuInRu, menuInUz } from 'src/keyboard';
import { ScenesProvider } from 'src/scenes/scenes.service';
import { Application } from 'src/schema/application.schema';
import { Users } from 'src/schema/users.schema';
import { Context, Telegraf } from 'telegraf';

export const userStates = new Map();
// const groupId = '-1001867929617';

@Update()
@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
    private readonly botcommands: BotCommands,
    private readonly scenesProvider: ScenesProvider,
    @InjectBot() private bot: Telegraf<Context>,
    @InjectModel(Application.name)
    private readonly appModel: Model<Application>,
  ) {}
  onModuleInit() {
    console.log('BotService moduli ishga tushdi');
  }
  @Start()
  async start(@Ctx() ctx: Context) {
    await this.botcommands.startCommand(ctx);
    userStates.set(ctx.message.chat.id, undefined);
    console.log(ctx.message.chat.id);
  }
  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const userId = ctx.message?.from?.id;
    const chatId = ctx.message?.chat?.id;

    // const messageId = ctx.message?.message_id;
    const message = ctx.text;
    // const location = ctx.message as any;

    const currentState = userStates.get(chatId);
    //choose language
    if (message === 'Uzbek 🇺🇿') {
      await this.userModel.updateOne(
        { telegram_id: userId },
        { chat_language: 'uz' },
      );
      await ctx.reply('Tanlang!', menuInUz);
      userStates.set(ctx.message.chat.id, undefined);
    } else if (message === 'Rus 🇷🇺') {
      await this.userModel.updateOne(
        { telegram_id: userId },
        { chat_language: 'ru' },
      );
      await ctx.reply('Выбирать!', menuInRu);
      userStates.set(ctx.message.chat.id, undefined);
    }

    const user = await this.userModel.findOne({ telegram_id: userId });
    const currentApps = await this.appModel.find({ userId: user._id });
    const currentApp = currentApps.pop();

    if (message === 'Taxi chaqirish 🚕' || message === 'Вызвать такси 🚕') {
      if (!currentState) {
        await this.botcommands.startStep(ctx, user);
        userStates.set(chatId, [true, 'step1']);
      }
    }
    if (currentState && currentState[0] && currentState[1] === 'step1') {
      await this.botcommands.addFullName(ctx, user);
      userStates.set(chatId, [true, 'step2']);
    }
    if (currentState && currentState[0] && currentState[1] === 'step2') {
      await this.botcommands.addCurrentAddress(ctx, user, currentApp);
      userStates.set(chatId, [true, 'step3']);
    }
    if (currentState && currentState[0] && currentState[1] === 'step3') {
      await this.botcommands.addPhoneNumber(ctx, user, currentApp);
      userStates.set(chatId, [true, 'step4']);
    }
    if (currentState && currentState[0] && currentState[1] === 'step4') {
      await this.botcommands.addAddress(ctx, user, currentApp);
      userStates.set(chatId, [true, 'step5']);
    }
    if (currentState && currentState[0] && currentState[1] === 'step5') {
      await this.botcommands.addDeparture(ctx, user, currentApp);
      userStates.set(chatId, undefined);
    }
    if (message === `Tilni o'zgartirish 🇷🇺`) {
      await this.botcommands.changeLanguage(ctx);
    }
  }

  @Action('tasdiqlash')
  async confirmation(@Ctx() ctx: Context) {
    await this.botcommands.sendGroup(ctx);
  }
  @Action('bekor_qilish')
  async dismiss(@Ctx() ctx: Context) {
    await this.botcommands.dismiss(ctx);
  }
}
