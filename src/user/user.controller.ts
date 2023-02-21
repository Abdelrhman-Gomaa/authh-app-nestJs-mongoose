import { Controller, Get, Post } from '@nestjs/common';
import { RegisterInput } from './input/register.input';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async register(input: RegisterInput){
    return await this.userService.register(input)
  }

  @Get()
  async testPath(){
    return 'hello'
  }

}
