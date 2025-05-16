import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/db';
import { initializeDatabase } from '@/db';
import { Comment, User } from '@/db/entities';
import { verify } from 'jsonwebtoken';
import { IsNull } from 'typeorm';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 定义简化版的用户信息接口
interface SimplifiedUser {
  id: string;
  username: string;
}

// 定义简化版的评论接口
interface SimplifiedComment {
  id: string;
  content: string;
  user?: SimplifiedUser;
}

/**
 * 获取评论列表
 * GET /api/comments?problemId=xxx
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

    // 查询评论
    const commentRepository = AppDataSource.getRepository(Comment);
    const userRepository = AppDataSource.getRepository(User);
    
    // 获取顶级评论（不是回复）
    const topLevelComments = await commentRepository.find({
      where: { 
        problemId,
        parentId: IsNull()
      },
      order: {
        createdAt: 'DESC'
      }
    });
    
    // 处理评论作者信息和引用信息
    const commentsWithUser = await Promise.all(
      topLevelComments.map(async (comment) => {
        // 获取用户信息
        const user = await userRepository.findOne({
          where: { id: comment.userId },
          select: ['id', 'username'] // 只返回安全的用户信息
        });
        
        // 处理引用的评论
        let quotedComment: SimplifiedComment | null = null;
        if (comment.quotedCommentId) {
          const quotedCommentEntity = await commentRepository.findOne({
            where: { id: comment.quotedCommentId },
            select: ['id', 'content', 'userId']
          });
          
          // 获取被引用评论的作者
          if (quotedCommentEntity) {
            const quotedUser = await userRepository.findOne({
              where: { id: quotedCommentEntity.userId },
              select: ['id', 'username']
            });
            
            quotedComment = {
              id: quotedCommentEntity.id,
              content: quotedCommentEntity.content
            };
            
            if (quotedUser) {
              quotedComment.user = {
                id: quotedUser.id,
                username: quotedUser.username
              };
            }
          }
        }
        
        const simplifiedComment = {
          ...comment,
          user: user ? {
            id: user.id,
            username: user.username
          } : undefined,
          quotedComment
        };
        
        return simplifiedComment;
      })
    );

    return NextResponse.json({
      comments: commentsWithUser
    });
  } catch (error: any) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: `获取评论失败: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * 添加评论
 * POST /api/comments
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权访问' },
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
        { error: '无效的令牌' },
        { status: 401 }
      );
    }
    
    // 获取用户ID
    const userId = (decodedToken as any).id;
    
    // 获取请求体
    const body = await request.json();
    const { 
      problemId, 
      content, 
      hasCode = false, 
      codeBlock = null, 
      codeLanguage = 'python',
      parentId = null, 
      quotedCommentId = null 
    } = body;
    
    // 验证必填字段
    if (!problemId || !content) {
      return NextResponse.json(
        { error: '问题ID和评论内容为必填字段' },
        { status: 400 }
      );
    }
    
    // 初始化数据库连接
    await initializeDatabase();
    
    // 创建新评论
    const commentRepository = AppDataSource.getRepository(Comment);
    
    // 确定评论层级
    let level = 0;
    
    // 如果是回复，则层级+1
    if (parentId) {
      const parentComment = await commentRepository.findOne({
        where: { id: parentId }
      });
      
      if (parentComment) {
        level = parentComment.level + 1;
        
        // 更新父评论的回复数
        await commentRepository.update(
          { id: parentId },
          { repliesCount: () => 'replies_count + 1' }
        );
      }
    }
    
    // 创建评论记录
    const newComment = commentRepository.create({
      problemId,
      userId,
      content,
      hasCode,
      codeBlock,
      codeLanguage,
      parentId,
      quotedCommentId,
      level,
      repliesCount: 0,
      likesCount: 0
    });
    
    // 保存评论
    const savedComment = await commentRepository.save(newComment);
    
    // 获取用户信息
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'username']
    });
    
    // 获取引用的评论信息
    let quotedComment: SimplifiedComment | null = null;
    if (quotedCommentId) {
      const quotedCommentEntity = await commentRepository.findOne({
        where: { id: quotedCommentId },
        select: ['id', 'content', 'userId']
      });
      
      if (quotedCommentEntity) {
        const quotedUser = await userRepository.findOne({
          where: { id: quotedCommentEntity.userId },
          select: ['id', 'username']
        });
        
        quotedComment = {
          id: quotedCommentEntity.id,
          content: quotedCommentEntity.content
        };
        
        if (quotedUser) {
          quotedComment.user = {
            id: quotedUser.id,
            username: quotedUser.username
          };
        }
      }
    }
    
    // 返回带用户信息的评论
    return NextResponse.json({
      success: true,
      comment: {
        ...savedComment,
        user: user ? {
          id: user.id,
          username: user.username
        } : undefined,
        quotedComment
      }
    });
  } catch (error: any) {
    console.error('添加评论失败:', error);
    return NextResponse.json(
      { error: `添加评论失败: ${error.message}` },
      { status: 500 }
    );
  }
} 