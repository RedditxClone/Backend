import { stubComment } from '../../comment/test/stubs/comment.stubs';
export const PostCommentService = jest.fn().mockReturnValue({
  update: jest.fn().mockReturnValue(stubComment()),
});
