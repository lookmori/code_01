import { NextRequest, NextResponse } from 'next/server';
import { ProblemRepository } from '@/db/repositories/problem.repository';
import { initializeDatabase } from '@/db';
import { AppDataSource } from '@/db';
import { Problem } from '@/db/entities';

/**
 * 获取所有问题
 * GET /api/problems
 */
export async function GET(request: NextRequest) {
  try {
    // 初始化数据库连接
    await initializeDatabase();

    // 直接从数据库查询，避免使用仓库方法
    const problemRepository = AppDataSource.getRepository(Problem);
    const problems = await problemRepository.find({
      order: {
        publishedAt: 'DESC'
      }
    });

    // 手动转换JSON字段，确保安全解析
    const safeProblems = problems.map(problem => {
      let tags = [];
      // 安全解析tag字段
      if (problem.tag) {
        try {
          // 如果是字符串类型，尝试解析JSON
          if (typeof problem.tag === 'string') {
            tags = JSON.parse(problem.tag);
          } 
          // 如果已经是数组类型，直接使用
          else if (Array.isArray(problem.tag)) {
            tags = problem.tag;
          }
          // 如果是其他类型，转换为字符串数组
          else {
            tags = [String(problem.tag)];
          }
        } catch (error) {
          console.error(`解析问题标签失败: ${problem.id}`, error);
          // 解析失败时作为单个标签处理
          tags = [problem.tag];
        }
      }

      return {
        id: problem.id,
        problem_name: problem.problemName,
        problem_description: problem.problemDescription,
        example_input: problem.exampleInput,
        example_output: problem.exampleOutput,
        ques_tag: tags,
        published_at: problem.publishedAt
      };
    });

    return NextResponse.json({
      problems: safeProblems
    });
  } catch (error: any) {
    console.error('获取问题列表失败:', error);
    return NextResponse.json(
      { error: `获取问题列表失败: ${error.message}` },
      { status: 500 }
    );
  }
} 