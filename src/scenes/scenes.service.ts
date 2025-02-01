import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserApplication } from 'src/common/interface';
import { confirmationKeyInUz } from 'src/keyboard';
import { Users } from 'src/schema/users.schema';
import { Scenes } from 'telegraf';

@Injectable()
export class ScenesProvider {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
  ) {}

  createTaxiConversation(): Scenes.WizardScene<Scenes.WizardContext> {
    return new Scenes.WizardScene(
      'user_info',
      async (ctx: Scenes.WizardContext) => {
        await ctx.reply(`To'liq ismingizni kiriting:`);
        return ctx.wizard.next();
      },
      async (ctx: Scenes.WizardContext) => {
        if (!ctx.message || !('text' in ctx.message)) return;

        (ctx.wizard.state as UserApplication).full_name = ctx.message.text;

        await ctx.reply(`Hozilgi turgan manzilingizni kirinting:`);

        return ctx.wizard.next();
      },
      async (ctx: Scenes.WizardContext) => {
        if (!ctx.message || !('text' in ctx.message)) return;
        (ctx.wizard.state as UserApplication).currnet_address =
          ctx.message.text;
        await ctx.reply(`Telfon raqamigizni kiriting:`);
        return ctx.wizard.next();
      },

      async (ctx: Scenes.WizardContext) => {
        if (!ctx.message || !('text' in ctx.message)) return;
        (ctx.wizard.state as UserApplication).phone_number = ctx.message.text;
        await ctx.reply(`Bormoqchi bo'lgan manzilingizni kiriting:`);
        return ctx.wizard.next();
      },
      async (ctx: Scenes.WizardContext) => {
        if (!ctx.message || !('text' in ctx.message)) return;
        (ctx.wizard.state as UserApplication).where = ctx.message.text;
        await ctx.reply(`Bormoqchi bo'lgan manzilingizni kiriting:`);
        return ctx.wizard.next();
      },

      async (ctx: Scenes.WizardContext) => {
        if (!ctx.message || !('text' in ctx.message)) return;
        (ctx.wizard.state as UserApplication).departure_time = ctx.message.text;

        const userApp = ctx.wizard.state as UserApplication;
        const userAppReply = `
            Isim va familiya: ${userApp.full_name}
            Joriy manzil: ${userApp.currnet_address}
            Telfon raqam: ${userApp.phone_number}
            Tushish manzil: ${userApp.where}        
        `;
        await ctx.reply(userAppReply, confirmationKeyInUz);
        return ctx.scene.leave();
      },
    );
  }

  getStage(): Scenes.Stage<Scenes.WizardContext> {
    const userInfoScene = this.createTaxiConversation();
    return new Scenes.Stage([userInfoScene]);
  }
}
