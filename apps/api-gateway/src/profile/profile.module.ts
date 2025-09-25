import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mfc',
    }),
  ],
  controllers: [ProfileController],
})
export class ProfileModule {}