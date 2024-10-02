import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CountVote } from 'src/Schemas/countVotes.schemas';
import { CountVoteDto } from './DTO/CountVote.dto';

@Injectable()
export class CountVotesService {
    //ici on import la Class de CountCreateDoc et non le schema
    //nous avons généré un model de la Class CountCreateDoc    
constructor(@InjectModel(CountVote.name)private countVoteModel : Model<CountVote>){}


 // Crée un nouveau count ou incrémente s'il existe déjà
 async createOrUpdateCount(countVoteDto: CountVoteDto, ipAddress: string) {
    const { nameVote} = countVoteDto;
    if (nameVote !== "structure" && nameVote !== "questionanswers" && nameVote !== "questions"){
        throw new HttpException("Erreur de réponse attendu", 500)
    }

    // Vérifiez si l'IP existe déjà dans les votes
    const existingVote = await this.countVoteModel.findOne({ nameVote, ipAddress });

    if (existingVote) {
        throw new HttpException('Vous avez déjà voté.', 412); // Erreur 403 Forbidden
    }

    // Vérifier si le document existe déjà
    const existingCount = await this.countVoteModel.findOne({ nameVote: nameVote });

    if (existingCount) {
      // Si le document existe, incrémentez nombVote de 1
      existingCount.nombVote += 1;
      existingCount.ipAddress = ipAddress; // Mettre à jour l'adresse IP
      await existingCount.save();
    
      return { nameVote: existingCount.nameVote, nombVote: existingCount.nombVote };
    } else {
       // Si le document n'existe pas, créez un nouveau avec nombVote initialisé à 1
       const newCount = new this.countVoteModel({ nameVote, nombVote: 1, ipAddress });

       await newCount.save();
       return { nameVote: newCount.nameVote, nombVote: newCount.nombVote };
    }
  }

async getCountToStructure(){
    const structure = await this.countVoteModel.findOne({nameVote: "structure"});
    return structure ? structure.nombVote : 0;
}

async getCountQuestionAnswer(){
    const questionanswers = await this.countVoteModel.findOne({nameVote: "questionanswers"});
    return questionanswers ? questionanswers.nombVote : 0
}

async getCountJustQuestion(){
    const questions = await this.countVoteModel.findOne({nameVote: "questions"});
    return questions ? questions.nombVote : 0
}
}
