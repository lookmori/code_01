import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/db/repositories/user.repository';
import { User, UserRole } from '@/db/entities/User.entity';
import { initializeDatabase } from '@/db';

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
    const { username, email, password } = await request.json();

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '无效的邮箱格式' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度必须至少为6个字符' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已被使用
    const userRepository = new UserRepository();
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 创建新用户，默认角色为学生
    const newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.password = password;
    newUser.role = UserRole.STUDENT; // 始终设置为学生角色
    
    // 保存用户到数据库
    const savedUser = await userRepository.create(newUser);

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册处理过程中发生错误' },
      { status: 500 }
    );
  }
} 