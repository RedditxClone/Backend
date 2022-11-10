import { Module } from '@nestjs/common';

import { ImagesHandlerService } from './images-handler.service';

@Module({
  providers: [ImagesHandlerService],
  exports: [ImagesHandlerService],
})
export class ImagesHandlerModule {}
