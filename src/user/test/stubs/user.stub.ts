import { User } from '../../../user/user.schema';

export const stubUser = (): User => {
  return {
    username: 'username',
    email: 'email@example.com',
    hashPassword: 'thisIsHashedPassword',
    age: 12,
    suggestedSort: '',
    authType: 'user',
  };
};
