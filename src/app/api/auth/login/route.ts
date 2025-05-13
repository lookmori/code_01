import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { UserRepository } from '@/db/repositories/user.repository';
import { initializeDatabase } from '@/db';
import jwt from 'jsonwebtoken';

// 获取JWT密钥和过期时间
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_please_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 确保数据库初始化的函数
const ensureDbInitialized = async () => {
  try {
    await initializeDatabase();
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    // 确保数据库已初始化
    const dbInitialized = await ensureDbInitialized();
    if (!dbInitialized) {
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      );
    }

    // 解析请求体
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找用户
    const userRepository = new UserRepository();
    const user = await userRepository.findByEmail(email);

    // 如果用户不存在
    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 验证密码
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 创建JWT有效载荷，确保包含用户角色
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role // 添加用户角色
    };

    // 创建JWT令牌（忽略TypeScript错误）
    // @ts-ignore - jsonwebtoken类型定义有问题
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // 返回用户信息和令牌
    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录处理过程中发生错误' },
      { status: 500 }
    );
  }
} 