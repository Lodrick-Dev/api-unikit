import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class CountVote{
    @Prop({required: true})
    nameVote: string

    @Prop({required: true,default: 0 })
    nombVote: number

    @Prop({ type: [String], required: true, default: [] })
    ipAddress: string[];
}

export const CountVoteSchema = SchemaFactory.createForClass(CountVote)