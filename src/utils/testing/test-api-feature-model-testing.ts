import { Optional } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class TestModel {
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop()
  birthDate: Date;

  @Optional()
  @Prop({ default: '' })
  optionalTestField?: string;
}
export const TestModelSchema = SchemaFactory.createForClass(TestModel);
