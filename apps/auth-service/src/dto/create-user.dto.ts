import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'O email fornecido não é válido.' })
  @IsNotEmpty({ message: 'O email não pode estar vazio.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome de usuário não pode estar vazio.' })
  username!: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  password!: string;
}