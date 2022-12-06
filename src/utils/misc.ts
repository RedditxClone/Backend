import { extname } from 'node:path';

export const uniqueFileName = (req, file, callback) => {
  const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const ext = extname(file.originalname);
  const filename = `${file.originalname.split('.')[0]}-${uniquePrefix}${ext}`;
  callback(null, filename);
};
