import { Module } from '@nestjs/common';
import { OpenAiController } from './open-ai.controller';
import { OpenAiService } from './open-ai.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CountCreateDoc, CountCreateDocShema } from 'src/Schemas/countCreateDoc.schemas';

//CountCreateDocModule dans impots
//car j'aurai besoin de ses services
//dans OpenAiService
@Module({
  imports:[MongooseModule.forFeature([{ name: CountCreateDoc.name, schema: CountCreateDocShema }])],
  controllers: [OpenAiController],
  providers: [OpenAiService]
})
export class OpenAiModule {}
