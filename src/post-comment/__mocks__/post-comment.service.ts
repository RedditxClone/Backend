import { stubPostComment } from '../../post-comment/test/stubs/post-comment.stub';
export const PostCommentService = jest.fn().mockReturnValue({
  update: jest.fn().mockReturnValue(stubPostComment()),
});
