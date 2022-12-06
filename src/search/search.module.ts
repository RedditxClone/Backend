import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlockModule } from '../block/block.module';
import { UserSchema } from '../user/user.schema';
import { ApiFeaturesService } from '../utils/apiFeatures/api-features.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    BlockModule,
  ],
  controllers: [SearchController],
  providers: [SearchService, ApiFeaturesService],
})
export class SearchModule {}
