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

    // Vérifiez si le doc existe
    const existingVote = await this.countVoteModel.findOne({ nameVote});

    if (existingVote) {
        // Vérifiez si l'adresse IP est déjà dans le tableau
        if (existingVote.ipAddress.includes(ipAddress)) {
            throw new HttpException('Vous avez déjà voté.', 412); // Code 412: Precondition Failed
        }

    // Si l'IP n'est pas dans le tableau, incrémentez nombVote et ajoutez l'IP
    existingVote.nombVote += 1;
    existingVote.ipAddress.push(ipAddress); // Ajoutez la nouvelle adresse IP
    await existingVote.save();

    return { nameVote: existingVote.nameVote, nombVote: existingVote.nombVote };
    } else {
       // Si le document n'existe pas, créez un nouveau avec nombVote initialisé à 1
       const newCount = new this.countVoteModel({ nameVote, nombVote: 1, ipAddress:[ipAddress] });

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
