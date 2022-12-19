export const MessageService = jest.fn().mockReturnValue({
  messageOnReplies: jest.fn().mockImplementation(),
});
