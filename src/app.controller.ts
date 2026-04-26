import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      app: 'Leserva API',
      timestamp: new Date().toISOString(),
    };
  }
}
