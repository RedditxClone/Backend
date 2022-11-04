import { FlairDto } from 'src/subreddit/dto/flair.dto';

export const stubFlair = (): FlairDto => {
  return {
    text: 'welcome',
    backgroundColor: '000',
    textColor: 'fff',
  };
};
