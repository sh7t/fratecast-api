import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
export declare class UserService {
  private readonly userRepository;
  constructor(userRepository: Repository<User>);
  findOrSave(userId: number): Promise<User>;
  saveSettings(
    userId: number,
    settings: Partial<User>,
  ): Promise<import('typeorm').UpdateResult>;
}
