import type { HealthCheckResult } from '@nestjs/terminus';

export const healthCheckStub = (): HealthCheckResult => ({
  status: 'ok',
  info: { mongoose: { status: 'up' } },
  error: {},
  details: { mongoose: { status: 'up' } },
});
