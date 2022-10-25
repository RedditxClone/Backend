import { CreateUserDto } from './user.dto';

describe('CreateUserDto', () => {
  it('should be defined', () => {
    expect(new CreateUserDto()).toBeDefined();
  });
  it('should be equal', () => {
    const obj: any = {
      age: 12,
      email: 'myEmail@example.com',
      password: 'myPassword',
      username: 'userName',
    };
    const dto: CreateUserDto = obj;
    expect(dto).toEqual(obj);
  });
});
