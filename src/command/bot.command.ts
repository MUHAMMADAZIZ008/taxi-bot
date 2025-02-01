import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { keyboardLan } from 'src/keyboard';
import { Users } from 'src/schema/users.schema';
import { Context } from 'telegraf';

@Injectable()
export class BotCommands {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
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

  // async conversationForTaxi(ctx: Context) {
  //     const askFullName = new Scenes.
  // }
}
