import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class CountVote{
    @Prop({required: true})
    nameVote: string

    @Prop({required: true,default: 0 })
    nombVote: number

    @Prop({ required: true })
    ipAddress: string; // Stocker l'adresse IP
}

export const CountVoteSchema = SchemaFactory.createForClass(CountVote)