import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { initializeDatabase, AppDataSource } from '@/db';
import { User } from '@/db/entities';
import { compare, hash } from 'bcryptjs';

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 修改用户密码
 * POST /api/user/change-password
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
    let userId: string;
    try {
      // @ts-ignore
      const decodedToken = verify(token, JWT_SECRET);
      userId = (decodedToken as any).id;
    } catch (error) {
      return NextResponse.json(
        { error: '无效的令牌' },
        { status: 401 }
      );
    }
    
    // 获取请求数据
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    // 验证请求数据
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码都是必填项' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度不能少于6个字符' },
        { status: 400 }
      );
    }
    
    // 初始化数据库连接
    await initializeDatabase();
    
    // 查询用户
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'] // 选择需要的字段
    });
    
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 验证当前密码
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 400 }
      );
    }
    
    // 哈希新密码
    const hashedPassword = await hash(newPassword, 10);
    
    // 更新密码
    await userRepository.update(
      { id: userId },
      { password: hashedPassword }
    );
    
    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    });
    
  } catch (error: any) {
    console.error('修改密码失败:', error);
    
    return NextResponse.json(
      { error: `修改密码失败: ${error.message}` },
      { status: 500 }
    );
  }
} 