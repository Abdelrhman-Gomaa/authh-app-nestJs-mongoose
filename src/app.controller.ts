import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RegisterInput } from './user/input/register.input';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
