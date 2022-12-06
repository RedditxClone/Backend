import { stubComment } from '../../comment/test/stubs/comment.stubs';
export const CommentService = jest.fn().mockReturnValue({
  create: jest.fn().mockReturnValue(stubComment()),
});
