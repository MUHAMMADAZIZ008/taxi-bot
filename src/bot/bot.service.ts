import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ctx, InjectBot, On, Start, Update } from 'nestjs-telegraf';
import { BotCommands } from 'src/command/bot.command';
import { menuInRu, menuInUz } from 'src/keyboard';
import { ScenesProvider } from 'src/scenes/scenes.service';
import { Users } from 'src/schema/users.schema';
import { Context, Scenes, session, Telegraf } from 'telegraf';

@Update()
@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
    private readonly botcommands: BotCommands,
    private readonly scenesProvider: ScenesProvider,
    @InjectBot() private bot: Telegraf<Scenes.WizardContext>,
  ) {
    this.bot.use(session());
    this.bot.use(this.scenesProvider.getStage());
  }
  onModuleInit() {
    console.log('BotService moduli ishga tushdi');
    this.bot.use(session()); // Avval session qo‘shish kerak
    this.bot.use(this.scenesProvider.getStage()); // Keyin sahnalarni qo‘shish
  }
  @Start()
  async start(@Ctx() ctx: Context) {
    await this.botcommands.startCommand(ctx);
  }
  @On('message')
  async onMessage(@Ctx() ctx: Scenes.WizardContext) {
    const userId = ctx.message?.from?.id;
    // const chatId = ctx.message?.chat?.id;
    // const messageId = ctx.message?.message_id;
    const message = ctx.text;

    //choose language
    if (message === 'Uzbek 🇺🇿') {
      await this.userModel.updateOne(
        { telegram_id: userId },
        { chat_language: 'uz' },
      );
      await ctx.reply('Tanlang!', menuInUz);
    } else if (message === 'Rus 🇷🇺') {
      await this.userModel.updateOne(
        { telegram_id: userId },
        { chat_language: 'ru' },
      );
      await ctx.reply('Выбирать!', menuInRu);
    }

    if (message === 'Taxi chaqirish 🚕' || message === 'Вызвать такси 🚕') {
      await ctx.scene.enter('user_info');
    }
  }
}
