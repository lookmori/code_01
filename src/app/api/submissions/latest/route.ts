import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/db';
import { initializeDatabase } from '@/db';
import { Submission } from '@/db/entities';
import { verify } from 'jsonwebtoken';

// 将路由标记为动态
export const dynamic = 'force-dynamic';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 获取用户对特定问题的最新提交
 * GET /api/submissions/latest?problemId=xxx
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

    // 初始化数据库连接
    await initializeDatabase();

    // 查询该用户对该问题的最新提交
    const submissionRepository = AppDataSource.getRepository(Submission);
    const latestSubmission = await submissionRepository.findOne({
      where: {
        problemId,
        userId
      },
      order: {
        submittedAt: 'DESC'
      }
    });

    if (!latestSubmission) {
      return NextResponse.json({
        submission: null
      });
    }

    return NextResponse.json({
      submission: latestSubmission
    });
  } catch (error: any) {
    console.error('获取最新提交失败:', error);
    return NextResponse.json(
      { error: `获取最新提交失败: ${error.message}` },
      { status: 500 }
    );
  }
} 