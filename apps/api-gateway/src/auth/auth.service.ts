import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async register(data: { email: string; username: string; password: string }) {
    try {
      const user = await lastValueFrom(
        this.authClient.send('auth.register', data)
      );
      
      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        username: user.username,
      });

      return { accessToken, user };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Registration failed');
    }
  }

  async login(data: { email: string; password: string }) {
    try {
      const result = await lastValueFrom(
        this.authClient.send('auth.login', data)
      );
      return result;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid credentials');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verificar se o refresh token é válido
      const payload = this.jwtService.verify(refreshToken, {
        ignoreExpiration: false,
      });

      // Gerar novo access token
      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          username: payload.username,
        },
        { expiresIn: '15m' }
      );

      return {
        accessToken: newAccessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    try {
      const user = await lastValueFrom(
        this.authClient.send('auth.validate', { userId })
      );
      return user;
    } catch (error) {
      throw new UnauthorizedException('User validation failed');
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await lastValueFrom(
        this.authClient.send('auth.getUserById', { userId })
      );
      return user;
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }
}