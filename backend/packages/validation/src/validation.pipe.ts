import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';

function flattenValidationErrors(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints ? Object.values(error.constraints).map((m) => `${path}: ${m}`) : [];
    const children = error.children?.length ? flattenValidationErrors(error.children, path) : [];
    return [...own, ...children];
  });
}

export const appValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  exceptionFactory: (errors: ValidationError[]) =>
    new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: flattenValidationErrors(errors)
    })
});
