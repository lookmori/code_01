import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/db';
import { initializeDatabase } from '@/db';
import { Submission, User, Problem } from '@/db/entities';
import { verify } from 'jsonwebtoken';
import { CozeJwtService } from '@/services/coze-jwt.service';
import { SubmitCodeRequest, SubmissionStatus } from '@/types/practice';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 获取用户提交记录
 * GET /api/submissions?problemId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    // 获取问题ID参数
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');
    
    if (!problemId) {
      return NextResponse.json(
        { error: '请提供问题ID' },
        { status: 400 }
      );
    }

    // 初始化数据库连接
    await initializeDatabase();

    // 查询提交记录
    const submissionRepository = AppDataSource.getRepository(Submission);
    
    // 获取认证令牌，确认用户身份
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      
      try {
        // @ts-ignore
        const decodedToken = verify(token, JWT_SECRET);
        userId = (decodedToken as any).id;
      } catch (error) {
        // 忽略令牌错误，只返回公开数据
      }
    }
    
    // 构建查询条件
    const whereCondition: any = { problemId };
    if (userId) {
      // 如果有认证，返回用户自己的提交记录
      whereCondition.userId = userId;
    }
    
    // 查询提交记录
    const submissions = await submissionRepository.find({
      where: whereCondition,
      order: {
        submittedAt: 'DESC'
      },
      take: 10 // 限制结果数量
    });

    return NextResponse.json({
      submissions
    });
  } catch (error: any) {
    console.error('获取提交记录失败:', error);
    return NextResponse.json(
      { error: `获取提交记录失败: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * 提交代码
 * POST /api/submissions
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问，请先登录' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // 解析JWT令牌
    let decodedToken;
    try {
      // @ts-ignore
      decodedToken = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: '无效的令牌，请重新登录' },
        { status: 401 }
      );
    }
    
    // 获取用户ID
    const userId = (decodedToken as any).id;
    console.log('提交代码 - 用户ID:', userId);
    
    // 获取请求体
    const body = await request.json();
    const { problemId, code, problemDescription } = body as SubmitCodeRequest;
    
    // 验证必填字段
    if (!problemId || !code) {
      return NextResponse.json(
        { error: '问题ID和代码为必填字段' },
        { status: 400 }
      );
    }
    
    // 初始化数据库连接
    await initializeDatabase();
    
    // 检查问题是否存在
    const problemRepository = AppDataSource.getRepository(Problem);
    const problem = await problemRepository.findOne({
      where: { id: problemId }
    });
    
    if (!problem) {
      return NextResponse.json(
        { error: '问题不存在' },
        { status: 404 }
      );
    }
    
    // 调用Coze工作流评估代码，传递真实用户ID
    const cozeResult = await CozeJwtService.submitCode({
      problemId,
      code,
      problemDescription: problemDescription || problem.problemDescription,
      userId // 确保传递用户ID
    });
    
    if (!cozeResult.success) {
      return NextResponse.json(
        { error: cozeResult.error || '代码评估失败' },
        { status: 500 }
      );
    }
    
    // 创建提交记录
    const submissionRepository = AppDataSource.getRepository(Submission);
    const newSubmission = submissionRepository.create({
      problemId,
      userId, // 确保使用真实用户ID
      codeAnswer: code,
      status: cozeResult.submission?.status || SubmissionStatus.PENDING,
      executionTime: cozeResult.submission?.executionTime,
      memoryUsed: cozeResult.submission?.memoryUsed,
      errorMessage: cozeResult.submission?.errorMessage,
      evaluationResult: cozeResult.submission?.evaluationResult
    });
    
    // 保存提交记录
    const savedSubmission = await submissionRepository.save(newSubmission);
    
    // 获取用户信息
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username']
    });
    
    // 返回带用户和问题信息的提交记录
    return NextResponse.json({
      success: true,
      submission: {
        ...savedSubmission,
        user: user ? {
          id: user.id,
          username: user.username
        } : undefined,
        problem: {
          id: problem.id,
          title: problem.problemName
        }
      }
    });
  } catch (error: any) {
    console.error('提交代码失败:', error);
    return NextResponse.json(
      { error: `提交代码失败: ${error.message}` },
      { status: 500 }
    );
  }
} 