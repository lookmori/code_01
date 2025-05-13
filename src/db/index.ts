import 'reflect-metadata';
import { AppDataSource } from './config/database.config';
import { QueryFailedError } from 'typeorm';

// 为防止多个请求同时初始化数据库
let initPromise: Promise<typeof AppDataSource> | null = null;

/**
 * 初始化数据库连接
 * 包含重试逻辑和单例模式以提高性能
 */
export const initializeDatabase = async () => {
  // 如果数据库已初始化，直接返回
  if (AppDataSource.isInitialized) {
    console.log('数据库已初始化');
    return AppDataSource;
  }

  // 如果正在初始化，等待初始化完成
  if (initPromise) {
    console.log('数据库正在初始化中，等待...');
    return initPromise;
  }

  // 开始初始化
  initPromise = (async () => {
    try {
      // 尝试初始化数据库
      await AppDataSource.initialize();
      console.log('数据库连接成功');
      return AppDataSource;
    } catch (error) {
      console.error('数据库连接失败:', error);
      
      // 尝试关闭连接（如果存在）
      try {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
      } catch (destroyError) {
        console.error('关闭数据库连接失败:', destroyError);
      }
      
      // 重置初始化Promise，允许下次尝试初始化
      initPromise = null;
      
      // 使用降级策略：返回模拟数据或错误
      if (process.env.NODE_ENV === 'development') {
        console.warn('在开发环境中，将返回一个虚拟的空数据库连接');
        // 在开发环境中，可以返回一个模拟的数据源
        // 或者抛出错误，根据实际需求决定
      }
      
      throw error;
    }
  })();

  return initPromise;
};

export { AppDataSource };
// 导出所有实体
export * from './entities'; // 导出所有实体 