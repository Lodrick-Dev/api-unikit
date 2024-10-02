import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiModule } from './open-ai/open-ai.module';
import { ConfigModule } from '@nestjs/config';
import { OpenAiController } from './open-ai/open-ai.controller';
import { OpenAiService } from './open-ai/open-ai.service';
import { CountVotesModule } from './count-votes/count-votes.module';

@Module({
  imports: [ ConfigModule.forRoot(),MongooseModule.forRoot(
    process.env.URI_BD), OpenAiModule, CountVotesModule],
  controllers: [],
  providers: [],
  // controllers: [OpenAiController],
  // providers: [OpenAiService],
})
export class AppModule {}
