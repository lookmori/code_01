/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 禁用服务器端渲染时的资源大小警告
  experimental: {
    largePageDataBytes: 128 * 100000, // 默认是128KB
  },
  // 配置webpack排除一些TypeORM相关的不必要模块
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 不在客户端打包这些模块
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'react-native-sqlite-storage': false,
        '@sap/hana-client/extension/Stream': false,
        mysql: false,
      };
    }
    return config;
  },
  // 配置Monaco Editor资源的缓存策略
  async headers() {
    return [
      {
        source: '/monaco-editor/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // 添加动态API路由配置
  serverRuntimeConfig: {
    dynamic: 'force-dynamic', // 在服务器端强制动态渲染
  },
};

module.exports = nextConfig; 