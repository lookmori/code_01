import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entities/User.entity';
import { Problem } from '../entities/Problem.entity';
import { Comment } from '../entities/Comment.entity';
import { Submission } from '../entities/Submission.entity';

// 数据库配置选项
export const dbConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '3364487975lfp.',
  database: process.env.DB_NAME || 'learn_platform',
  entities: [User, Problem, Comment, Submission],
  synchronize: true, // 打开自动同步，以创建数据库表结构
  logging: true,
  // 添加额外配置
  cache: false,
  dropSchema: false, // 不要在每次连接时删除已有的数据库架构
  migrationsRun: false, // 不自动运行迁移
  metadataTableName: 'typeorm_metadata',
  extra: {
    connectionLimit: 10
  }
};

// 创建数据库连接
export const AppDataSource = new DataSource(dbConfig); 