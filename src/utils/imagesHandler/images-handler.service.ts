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
      this.uploadPhotoToServer(file, saveDir),
      Model.findByIdAndUpdate(targetId, accessedField).select(''),
    ]);

    return accessedField;
  }

  async uploadPhotoToServer(file: any, saveDir: string) {
    return sharp(file.buffer).toFormat('jpeg').toFile(saveDir);
  }

  async removePhoto(saveDir: string) {
    try {
      await unlink(saveDir);
    } catch {
      throw new BadRequestException({
        description: 'No photo already exist',
      });
    }

    return { status: 'success' };
  }
  /*async removePhoto(
    folderName: string,
    Model: Model<any>,
    targetId: Types.ObjectId,
    fieldName: string,
  ) {
    const saveDir = `src/statics/${folderName}/${targetId}.jpeg`;
    const accessedField: any = {};
    accessedField[fieldName] = '';
    const res = await Model.updateOne({ _id: targetId }, accessedField).select(
      '',
    );

    if (!res.matchedCount) {
      throw new NotFoundException(`No ${Model.name} with such id`);
    }

    if (!res.modifiedCount) {
      throw new BadRequestException({
        description: `The ${Model.name} doesn't have already an image`,
      });
    }

    await unlink(saveDir);

    return { status: 'success' };
  } */
}
