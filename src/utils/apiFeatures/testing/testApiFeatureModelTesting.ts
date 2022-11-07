import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class TestApiFeature {
  @Prop()
  name: string;
  @Prop()
  age: number;
  @Prop()
  birthDate: Date;
}
export const TestApiFeatureSchema =
  SchemaFactory.createForClass(TestApiFeature);
