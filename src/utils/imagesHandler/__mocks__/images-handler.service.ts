import { stubImagesHandler } from '../test/stubs/image-handler.stub';

export const ImagesHandlerService = jest.fn().mockReturnValue({
  uploadPhoto: jest.fn().mockReturnValue(stubImagesHandler()),
  removePhoto: jest.fn().mockReturnValue({ status: 'success' }),
});
