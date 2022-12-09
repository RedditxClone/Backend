import type { TokenPayload } from 'google-auth-library';

export const stubGoogle = (): TokenPayload => ({
  email: 'example@gmail.com',
  aud: 'test',
  exp: 134,
  iat: 134,
  iss: 'test',
  sub: 'test',
});
