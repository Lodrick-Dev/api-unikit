import { Module } from '@nestjs/common';
import { CountVotesController } from './count-votes.controller';
import { CountVotesService } from './count-votes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CountVote, CountVoteSchema } from 'src/Schemas/countVotes.schemas';
import { CountCreateDoc, CountCreateDocShema } from 'src/Schemas/countCreateDoc.schemas';

//MongooseModule.forFeature() est utilisé pour configurer le schéma Mongoose qui sera lié à ce module.
@Module({
  imports:[MongooseModule.forFeature([{name: CountVote.name, schema: CountVoteSchema}])],
  controllers: [CountVotesController],
  providers: [CountVotesService]
})
export class CountVotesModule {}
