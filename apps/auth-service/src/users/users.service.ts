import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService, 
  ) {}

  async createUser(data: CreateUserDto): Promise<Omit<User, 'password'>> {
    this.logger.log(`Attempting to create user with email: ${data.email}`);

    const existingUser = await this.usersRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      this.logger.warn(
        `User already exists with email or username: ${data.email} | ${data.username}`,
      );
      throw new RpcException({
        message: 'Email ou nome de usuário já cadastrado.',
        status: HttpStatus.CONFLICT,
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    this.logger.log('Password successfully hashed.');

    const newUser = this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });

    await this.usersRepository.save(newUser);
    this.logger.log(`User ${newUser.id} created successfully.`);

    const { password, ...result } = newUser;
    return result;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async login(loginDto: { email: string; password_sent: string }) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn(`Login failed: User not found for email ${loginDto.email}`);
      throw new RpcException({
        message: 'Credenciais inválidas',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const isPasswordMatching = await bcrypt.compare(
      loginDto.password_sent,
      user.password,
    );

    if (!isPasswordMatching) {
      this.logger.warn(`Login failed: Invalid password for user ${user.id}`);
      throw new RpcException({
        message: 'Credenciais inválidas',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    this.logger.log(`User ${user.id} logged in successfully.`);

    return {
      accessToken,
      refreshToken,
    };
  }
}