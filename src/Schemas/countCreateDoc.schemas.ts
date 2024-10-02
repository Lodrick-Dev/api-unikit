import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class CountCreateDoc{
    @Prop({required : true})
    nameRequet: string;

    @Prop({required: true,default: 0})
    nombRequet: number
}

export const CountCreateDocShema = SchemaFactory.createForClass(CountCreateDoc);