import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email ou username já existe' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'create_user' }, createUserDto),
      );
      return result;
    } catch (error) {
      console.error('Error from auth-service:', error);
      throw new HttpException(
        error.message || 'Erro ao criar usuário',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'login_user' }, loginDto),
      );
      return result;
    } catch (error) {
      console.error('Error from auth-service:', error);
      throw new HttpException(
        error.message || 'Erro ao fazer login',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' }
      }
    }
  })
  async refresh(@Body() body: { refreshToken: string }) {
    try {
      const result = await firstValueFrom(
        this.authClient.send({ cmd: 'refresh_token' }, body),
      );
      return result;
    } catch (error) {
      console.error('Error from auth-service:', error);
      throw new HttpException(
        error.message || 'Erro ao renovar token',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}