import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    console.log('Headers:', request.headers); // DEBUG
    console.log('Token extraído:', token); // DEBUG
    
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const payload = this.jwtService.verify(token);
      console.log('Payload do token:', payload); // DEBUG
      request.user = payload;
      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error); // DEBUG
      throw new UnauthorizedException('Token inválido');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}