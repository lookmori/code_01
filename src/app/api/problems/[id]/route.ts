import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/db';
import { AppDataSource } from '@/db';
import { Problem } from '@/db/entities';

/**
 * 获取单个问题详情
 * GET /api/problems/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取问题ID
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: '请提供问题ID' },
        { status: 400 }
      );
    }

    // 初始化数据库连接
    await initializeDatabase();

    // 从数据库查询问题
    const problemRepository = AppDataSource.getRepository(Problem);
    const problem = await problemRepository.findOne({
      where: { id }
    });

    if (!problem) {
      return NextResponse.json(
        { error: '找不到该问题' },
        { status: 404 }
      );
    }

    // 处理标签数据，确保安全解析
    let tags = [];
    
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
    
    // 返回格式化的问题数据
    return NextResponse.json({
      problem: {
        id: problem.id,
        slug: problem.id, // 目前使用ID作为slug
        title: problem.problemName,
        description: problem.problemDescription,
        example_input: problem.exampleInput,
        example_output: problem.exampleOutput,
        tags: tags,
        difficulty: 'medium', // 数据库中可能没有难度字段，默认为中等
        published_at: problem.publishedAt
      }
    });
  } catch (error: any) {
    console.error('获取问题详情失败:', error);
    return NextResponse.json(
      { error: `获取问题详情失败: ${error.message}` },
      { status: 500 }
    );
  }
} 