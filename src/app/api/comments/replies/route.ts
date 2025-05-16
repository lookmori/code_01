import { NextRequest, NextResponse } from 'next/server';
import { AppDataSource } from '@/db';
import { initializeDatabase } from '@/db';
import { Comment, User } from '@/db/entities';

// 将路由标记为动态
export const dynamic = 'force-dynamic';

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
 * 获取评论回复
 * GET /api/comments/replies?commentId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    // 获取评论ID参数
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    
    if (!commentId) {
      return NextResponse.json(
        { error: '请提供评论ID' },
        { status: 400 }
      );
    }

    // 初始化数据库连接
    await initializeDatabase();

    // 查询评论回复
    const commentRepository = AppDataSource.getRepository(Comment);
    const userRepository = AppDataSource.getRepository(User);
    
    // 获取所有回复
    const replies = await commentRepository.find({
      where: { 
        parentId: commentId
      },
      order: {
        createdAt: 'ASC'
      }
    });
    
    // 处理评论作者信息和引用信息
    const repliesWithUser = await Promise.all(
      replies.map(async (reply) => {
        // 获取用户信息
        const user = await userRepository.findOne({
          where: { id: reply.userId },
          select: ['id', 'username'] // 只返回安全的用户信息
        });
        
        // 处理引用的评论
        let quotedComment: SimplifiedComment | null = null;
        if (reply.quotedCommentId) {
          const quotedCommentEntity = await commentRepository.findOne({
            where: { id: reply.quotedCommentId },
            select: ['id', 'content', 'userId']
          });
          
          if (quotedCommentEntity) {
            // 获取被引用评论的作者
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
        
        const simplifiedReply = {
          ...reply,
          user: user ? {
            id: user.id,
            username: user.username
          } : undefined,
          quotedComment: quotedComment
        };
        
        return simplifiedReply;
      })
    );

    return NextResponse.json({
      replies: repliesWithUser
    });
  } catch (error: any) {
    console.error('获取评论回复失败:', error);
    return NextResponse.json(
      { error: `获取评论回复失败: ${error.message}` },
      { status: 500 }
    );
  }
} 