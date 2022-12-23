import { BadRequestException, Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import type { Model, Types } from 'mongoose';
import sharp from 'sharp';
/**
 * service for image handler module
 */
@Injectable()
export class ImagesHandlerService {
  /**
   * uploads a photo
   * @param folderName the directory name
   * @param file the file to be uploaded
   * @param Model the model
   * @param targetId the target object id
   * @param fieldName the field name
   * @returns access field
   */
  async uploadPhoto(
    folderName: string,
    file: any,
    Model: Model<any>,
    targetId: Types.ObjectId,
    fieldName: string,
  ) {
    const saveDir = `assets/${folderName}/${targetId}.jpeg`;
    const accessedField: any = {};
    accessedField[fieldName] = saveDir;
    await Promise.all([
      this.uploadPhotoToServer(file, saveDir),
      Model.findByIdAndUpdate(targetId, accessedField).select(''),
    ]);

    return accessedField;
  }

  /**
   * uploads a photo on a server
   * @param file the file to be uploaded
   * @param saveDir the save directory
   */
  async uploadPhotoToServer(file: any, saveDir: string) {
    return sharp(file.buffer).toFormat('jpeg').toFile(saveDir);
  }

  /**
   * deletes a photo
   * @param saveDir the save directory
   * @returns `{ status: 'success' }`
   */
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
    const saveDir = `assets/${folderName}/${targetId}.jpeg`;
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
