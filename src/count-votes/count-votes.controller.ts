import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CountVotesService } from './count-votes.service';
import { CountVoteDto } from './DTO/CountVote.dto';

@Controller('count-votes')
export class CountVotesController {
    constructor(private countVotesService: CountVotesService){}

    @Post("one")
    createStructureCount(@Body() countCreateVoteDto: CountVoteDto, @Req() req:any){
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Récupérer l'IP
        return this.countVotesService.createOrUpdateCount(countCreateVoteDto, ipAddress);
    }

    @Get("structure")
    async getStructureCount(){
        return await this.countVotesService.getCountToStructure();
    }
    @Get("question/answer")
    async getQuestionAnswer(){
        return await this.countVotesService.getCountQuestionAnswer();
    }
    @Get("questions")
    async getQuestions(){
        return await this.countVotesService.getCountJustQuestion();
    }
}
