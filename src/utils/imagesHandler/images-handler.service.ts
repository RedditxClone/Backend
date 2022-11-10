import { BadRequestException, Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import type { Model, Types } from 'mongoose';
import sharp from 'sharp';

@Injectable()
export class ImagesHandlerService {
  async uploadPhoto(
    folderName: string,
    file: any,
    Model: Model<any>,
    targetId: Types.ObjectId,
    fieldName: string,
  ) {
    const saveDir = `src/statics/${folderName}/${targetId}.jpeg`;
    const accessedField: any = {};
    accessedField[fieldName] = saveDir;
    await Promise.all([
      sharp(file.buffer).toFormat('jpeg').toFile(saveDir),
      Model.findByIdAndUpdate(targetId, accessedField).select(''),
    ]);

    return accessedField;
  }

  async removePhoto(folderName: string) {
    const saveDir = `src/statics/${folderName}`;

    try {
      await unlink(saveDir);
    } catch {
      throw new BadRequestException({
        description: 'No photo is uploaded',
      });
    }
  }
}
