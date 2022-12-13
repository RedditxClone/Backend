import type { ExposeOptions, TransformFnParams } from 'class-transformer';
import { Transform } from 'class-transformer';

// Hacky solution to prevent new ObjectId issue

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ExposeId =
  // eslint-disable-next-line @typescript-eslint/ban-types, unicorn/consistent-function-scoping, @typescript-eslint/no-unused-vars
  (options?: ExposeOptions) => (target: Object, propertyKey: string) => {
    Transform((params: TransformFnParams) => params.obj[propertyKey])(
      target,
      propertyKey,
    );
  };
