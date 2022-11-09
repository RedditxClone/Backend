import type { FlairDto } from 'subreddit/dto/flair.dto';

export const stubFlair = (): FlairDto => ({
  text: 'welcome',
  backgroundColor: '000',
  textColor: 'fff',
});
