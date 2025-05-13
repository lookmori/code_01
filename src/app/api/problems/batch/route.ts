import { NextRequest, NextResponse } from 'next/server';
import { ProblemRepository } from '@/db/repositories/problem.repository';
import { Problem } from '@/db/entities';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/user';
import { verify } from 'jsonwebtoken';
import { initializeDatabase } from '@/db'; // 导入数据库初始化函数

// 环境变量或配置中的JWT密钥（确保与登录API使用的相同）
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_please_change_in_production';

/**
 * 批量创建问题
 * POST /api/problems/batch
 */
export async function POST(request: NextRequest) {
  try {
    console.log('开始处理批量创建问题请求');
    
    // 初始化数据库连接
    await initializeDatabase();
    
    // 验证用户是否为管理员
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.log('未提供Authorization头');
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    console.log('Authorization头:', authHeader);
    const token = authHeader.split(' ')[1];
    console.log('提取的Token:', token);
    
    // 直接解析JWT令牌，不依赖AuthService
    let decodedToken;
    try {
      console.log('开始验证令牌，使用密钥:', JWT_SECRET.substring(0, 5) + '...');
      // @ts-ignore - jsonwebtoken类型定义不完整
      decodedToken = verify(token, JWT_SECRET);
      console.log('解码后的令牌:', decodedToken);
    } catch (error) {
      console.error('令牌验证失败:', error);
      return NextResponse.json(
        { error: '无效的令牌' },
        { status: 401 }
      );
    }
    
    // 验证用户角色
    const userRole = (decodedToken as any).role;
    console.log('用户角色:', userRole);
    
    // 管理员角色检查，直接使用字符串比较
    if (!userRole || userRole !== 'admin') {
      return NextResponse.json(
        { error: '权限不足，仅管理员可以批量创建问题' },
        { status: 403 }
      );
    }

    // 从请求体中获取问题数据
    const requestData = await request.json();
    const problems = requestData.problems;

    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json(
        { error: '请提供有效的问题数组' },
        { status: 400 }
      );
    }

    // 转换数据格式，将输入字段名称与数据库实体字段匹配
    const formattedProblems = problems.map((problem: any) => {
      // 确保标签以JSON字符串形式存储
      let tagStr = '[]';
      
      if (problem.ques_tag) {
        try {
          if (typeof problem.ques_tag === 'string') {
            // 尝试验证是否为有效JSON
            JSON.parse(problem.ques_tag);
            tagStr = problem.ques_tag;
          } else if (Array.isArray(problem.ques_tag)) {
            // 数组转换为JSON字符串
            tagStr = JSON.stringify(problem.ques_tag);
          } else {
            // 其他类型转换为字符串数组
            tagStr = JSON.stringify([String(problem.ques_tag)]);
          }
        } catch (e) {
          // 如果解析失败，存储为单个元素的数组
          tagStr = JSON.stringify([String(problem.ques_tag)]);
        }
      }
      
      return {
        problemName: problem.problem_name,
        problemDescription: problem.problem_description,
        exampleInput: problem.example_input,
        exampleOutput: problem.example_output,
        tag: tagStr
      };
    });

    // 保存到数据库
    const savedProblems = await ProblemRepository.createProblems(formattedProblems);

    return NextResponse.json({
      message: `成功创建 ${savedProblems.length} 个问题`,
      problems: savedProblems
    }, { status: 201 });
  } catch (error: any) {
    console.error('批量创建问题失败:', error);
    return NextResponse.json(
      { error: `批量创建问题失败: ${error.message}` },
      { status: 500 }
    );
  }
} 