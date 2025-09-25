import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      username: user.username 
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('Token inválido');
      }

      const newPayload = { 
        sub: user.id, 
        email: user.email,
        username: user.username 
      };

      return {
        accessToken: this.jwtService.sign(newPayload, { expiresIn: '15m' }),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}