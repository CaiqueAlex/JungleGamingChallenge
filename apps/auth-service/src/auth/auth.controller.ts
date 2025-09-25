import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() createUserDto: CreateUserDto) {
    console.log('✅ Auth Service: Comando "create_user" recebido!');
    return this.usersService.createUser(createUserDto);
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(@Payload() loginDto: LoginDto) {
    console.log('✅ Auth Service: Comando "login_user" recebido!');
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Erro ao fazer login',
        status: error.status || 500,
      });
    }
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(@Payload() data: { refreshToken: string }) {
    console.log('✅ Auth Service: Comando "refresh_token" recebido!');
    try {
      return await this.authService.refresh(data.refreshToken);
    } catch (error) {
      throw new RpcException({
        message: error.message || 'Erro ao renovar token',
        status: error.status || 500,
      });
    }
  }
}