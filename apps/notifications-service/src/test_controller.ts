import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class TestController {
  @EventPattern('task.created')
  async handleTaskCreated(@Payload() data: any) {
    console.log(' TEST CONTROLLER - TASK.CREATED RECEBIDO!', data);
    return { success: true };
  }

  @MessagePattern({ cmd: 'test' })
  async handleTest(@Payload() data: any) {
    console.log(' TEST CONTROLLER - MESSAGE PATTERN!', data);
    return { success: true, data };
  }
}