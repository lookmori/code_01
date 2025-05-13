import { AppDataSource } from '../config/database.config';
import { User } from '../entities/User.entity';
import { Repository } from 'typeorm';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  // 创建新用户
  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  // 根据ID查找用户
  async findById(id: string): Promise<User | null> {
    return await this.repository.findOneBy({ id });
  }

  // 根据邮箱查找用户
  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOneBy({ email });
  }

  // 获取所有用户
  async findAll(): Promise<User[]> {
    return await this.repository.find();
  }

  // 更新用户信息
  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.repository.update(id, userData);
    return await this.findById(id);
  }

  // 删除用户
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
} 