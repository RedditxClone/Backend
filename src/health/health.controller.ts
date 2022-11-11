import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@ApiExcludeController()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
  ) {}

  /**
   * Provide health check diagnostics at
   * the `health/` endpoint.
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([async () => this.mongoose.pingCheck('mongoose')]);
  }
}
