import { AppDataSource } from '@/db';
import { Problem } from '@/db/entities';

/**
 * 问题仓库 - 提供问题相关的数据库操作
 */
export class ProblemRepository {
  /**
   * 创建单个问题
   */
  static async createProblem(problemData: Partial<Problem>): Promise<Problem> {
    const problemRepository = AppDataSource.getRepository(Problem);
    const problem = problemRepository.create(problemData);
    return await problemRepository.save(problem);
  }

  /**
   * 批量创建问题
   */
  static async createProblems(problemsData: Partial<Problem>[]): Promise<Problem[]> {
    const problemRepository = AppDataSource.getRepository(Problem);
    const problems = problemRepository.create(problemsData);
    return await problemRepository.save(problems);
  }

  /**
   * 获取所有问题
   */
  static async getAllProblems(): Promise<Problem[]> {
    const problemRepository = AppDataSource.getRepository(Problem);
    return await problemRepository.find({
      order: {
        publishedAt: 'DESC'
      }
    });
  }

  /**
   * 根据ID获取问题
   */
  static async getProblemById(id: string): Promise<Problem | null> {
    const problemRepository = AppDataSource.getRepository(Problem);
    return await problemRepository.findOne({
      where: { id },
      relations: ['submissions', 'comments']
    });
  }

  /**
   * 搜索问题
   */
  static async searchProblems(query: string): Promise<Problem[]> {
    const problemRepository = AppDataSource.getRepository(Problem);
    return await problemRepository
      .createQueryBuilder('problem')
      .where('problem.problemName LIKE :query OR problem.problemDescription LIKE :query', {
        query: `%${query}%`
      })
      .orderBy('problem.publishedAt', 'DESC')
      .getMany();
  }

  /**
   * 删除问题
   */
  static async deleteProblem(id: string): Promise<boolean> {
    const problemRepository = AppDataSource.getRepository(Problem);
    const result = await problemRepository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
} 