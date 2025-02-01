import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScenesModule } from './scenes/scenes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule,
    MongooseModule.forRoot('mongodb://localhost:27017/taxi-bot'),
    ScenesModule,
  ],
})
export class AppModule {}
