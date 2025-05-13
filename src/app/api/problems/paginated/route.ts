import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, AppDataSource } from '@/db';
import { Problem, Submission, SubmissionStatus } from '@/db/entities';
import { verify } from 'jsonwebtoken';

// 将路由标记为动态
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_please_change_in_production';

/**
 * 获取带分页的问题列表，自动根据用户登录状态返回带状态的问题
 * GET /api/problems/paginated?page=1&pageSize=10
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    
    // 验证用户身份，不强制要求登录
    let userId: string | null = null;
    let userRole: string | null = null;
    
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      try {
        // @ts-ignore
        const decodedToken = verify(token, JWT_SECRET);
        userId = (decodedToken as any).id;
        userRole = (decodedToken as any).role;
      } catch (error) {
        // 忽略令牌错误，只返回公开数据
        console.error('验证令牌失败，继续处理公开数据:', error);
      }
    }
    
    // 初始化数据库连接
    await initializeDatabase();
    
    // 获取所有问题
    const problemRepository = AppDataSource.getRepository(Problem);
    const [problems, totalCount] = await problemRepository.findAndCount({
      order: {
        publishedAt: 'DESC'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });
    
    // 安全转换问题数据
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
        published_at: problem.publishedAt,
        difficulty: 'medium'
      };
    });
    
    // 如果是管理员或未登录，直接返回问题列表，无需提交状态
    if (userRole === 'admin' || !userId) {
      return NextResponse.json({
        problems: safeProblems,
        totalCount,
        page,
        pageSize
      });
    }
    
    // 获取用户提交记录
    let problemStatuses = new Map();
    try {
      const submissionRepository = AppDataSource.getRepository(Submission);
      
      // 获取用户在问题列表中的最新提交状态
      const problemIds = safeProblems.map(p => p.id);
      
      // 如果没有问题，直接返回
      if (problemIds.length === 0) {
        return NextResponse.json({
          problems: [],
          totalCount: 0,
          page,
          pageSize
        });
      }
      
      // 获取用户的所有提交记录
      const userSubmissions = await submissionRepository.find({
        where: {
          userId
        },
        order: {
          submittedAt: 'DESC'
        }
      });
      
      // 按问题ID构建最新提交状态的映射
      const latestSubmissionMap = new Map();
      
      for (const submission of userSubmissions) {
        if (!latestSubmissionMap.has(submission.problemId)) {
          latestSubmissionMap.set(submission.problemId, submission);
        }
      }
      
      // 提取提交状态
      problemIds.forEach(id => {
        const submission = latestSubmissionMap.get(id);
        if (submission) {
          problemStatuses.set(id, submission.status);
        }
      });
    } catch (error) {
      console.error('获取提交记录失败:', error);
      // 如果获取提交记录失败，继续处理，不返回状态
    }
    
    // 添加状态到问题
    const problemsWithStatus = safeProblems.map(problem => ({
      ...problem,
      status: problemStatuses.has(problem.id) 
        ? problemStatuses.get(problem.id) 
        : 'not_attempted'
    }));
    
    return NextResponse.json({
      problems: problemsWithStatus,
      totalCount,
      page,
      pageSize
    });
    
  } catch (error: any) {
    console.error('获取分页问题列表失败:', error);
    
    return NextResponse.json(
      { error: `获取问题列表失败: ${error.message}` },
      { status: 500 }
    );
  }
} 