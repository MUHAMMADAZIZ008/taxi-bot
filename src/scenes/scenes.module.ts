import { Module } from '@nestjs/common';
import { ScenesProvider } from './scenes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UserSchema } from 'src/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
  ],
  providers: [ScenesProvider],
  exports: [ScenesProvider],
})
export class ScenesModule {}
