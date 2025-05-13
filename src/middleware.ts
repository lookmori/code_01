import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 需要验证token的API路径
const AUTH_REQUIRED_PATHS = [
  '/api/user',
  '/api/admin',
  '/api/practice/submit',
  '/api/practice/solutions',
  // 添加其他需要认证的API路径
];

// 无需验证token的API路径
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  // 添加其他公共API路径
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 静态资源、页面、公共API无需验证
  if (
    !pathname.startsWith('/api/') || 
    PUBLIC_PATHS.some(path => pathname.startsWith(path))
  ) {
    return NextResponse.next();
  }
  
  // 检查是否需要验证token的路径
  const needsAuth = AUTH_REQUIRED_PATHS.some(path => pathname.startsWith(path));
  if (!needsAuth) {
    return NextResponse.next();
  }
  
  // 从请求头获取token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({ error: '未授权访问', message: '请先登录' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return new NextResponse(
      JSON.stringify({ error: '无效的认证令牌', message: '请先登录' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  try {
    // 验证JWT令牌
    const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_please_change_in_production';
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secretKey);
    
    // token验证成功，将用户信息添加到请求头中
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-ID', payload.id as string);
    requestHeaders.set('X-User-Email', payload.email as string);
    requestHeaders.set('X-User-Role', payload.role as string || 'student'); // 默认为学生角色
    
    // 创建修改后的请求
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    return response;
  } catch (error: any) {
    // 处理token过期或无效的情况
    let status = 401;
    let message = '认证失败';
    
    if (error.code === 'ERR_JWT_EXPIRED') {
      message = '登录已过期，请重新登录';
      status = 401;
    } else if (error.code === 'ERR_JWS_INVALID') {
      message = '无效的认证令牌';
      status = 401;
    } else {
      console.error('Token验证错误:', error);
      message = '认证过程中发生错误';
      status = 500;
    }
    
    return new NextResponse(
      JSON.stringify({ error: message, code: error.code }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    // 匹配所有API路由
    '/api/:path*',
  ],
}; 