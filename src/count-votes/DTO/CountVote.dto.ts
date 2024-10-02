import { IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CountVoteDto {
    @IsNotEmpty()
    @IsString()
    nameVote: string;
}