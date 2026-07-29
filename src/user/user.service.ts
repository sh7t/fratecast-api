import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserLocale } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOrSave(userId: number) {
    const existingUser = await this.userRepository.findOneBy({ userId });
    if (existingUser) return existingUser;

    const user = this.userRepository.create({ userId });
    return await this.userRepository.save(user);
  }

  async saveSettings(userId: number, settings: Partial<User>) {
    return await this.userRepository.update({ userId }, settings);
  }
}
