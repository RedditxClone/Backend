import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';

@Schema()
export class TestModel {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  birthDate: Date;

  @IsOptional()
  @Prop({ default: '' })
  optionalTestField?: string;
}
export const TestModelSchema = SchemaFactory.createForClass(TestModel);
