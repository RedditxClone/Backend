import { stubPost } from '../../post/test/stubs/post.stub';

export const PostService = jest.fn().mockReturnValue({
  create: jest.fn().mockReturnValue(stubPost()),
  uploadMedia: jest.fn().mockReturnValue({ status: 'success', mediaIds: [] }),
});
