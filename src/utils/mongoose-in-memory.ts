import type { MongooseModuleOptions } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | undefined;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();

      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

export const cleanInMongodConnection = async () => {
  if (mongod) {
    await mongod.cleanup();
  }
};

export const closeInMongodConnection = async () => {
  if (mongod) {
    await mongod.stop();
  }
};
