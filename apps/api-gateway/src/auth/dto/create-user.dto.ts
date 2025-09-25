import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario123', description: 'Nome de usuário único' })
  @IsString({ message: 'Username deve ser uma string' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  username: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email do usuário' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ example: 'senha123', description: 'Senha (mínimo 6 caracteres)' })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}