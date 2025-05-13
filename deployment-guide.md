# 宝塔面板部署指南

本文档将指导您如何在宝塔面板上部署Next.js应用程序。

## 准备工作

1. 一台安装了宝塔面板的Linux服务器
2. 域名（可选，但推荐）
3. 已构建的Next.js应用程序

## 部署步骤

### 第一步：安装Node.js环境

1. 登录宝塔面板
2. 点击左侧菜单的"软件商店"
3. 搜索并安装"PM2管理器"（这将同时安装Node.js）
4. 安装完成后，点击"PM2管理器"进入管理界面

### 第二步：创建MySQL数据库

1. 在宝塔面板左侧菜单点击"数据库"
2. 点击"添加数据库"
3. 填写数据库名称、用户名和密码，记录下这些信息
4. 点击"提交"创建数据库

### 第三步：上传应用程序文件

方法一：使用FTP上传
1. 在本地将项目打包：`npm run build`
2. 使用FTP工具（如FileZilla）连接到服务器
3. 将整个项目文件夹上传到服务器的适当位置（如 `/www/wwwroot/your-app-name`）

方法二：使用Git拉取（推荐）
1. 确保您的代码已经推送到Git仓库
2. 在服务器上，进入目标目录：`cd /www/wwwroot/`
3. 克隆仓库：`git clone https://your-git-repo-url.git your-app-name`
4. 进入项目目录：`cd your-app-name`
5. 安装依赖：`npm install --production`
6. 构建项目：`npm run build`

### 第四步：配置环境变量

在项目根目录创建 `.env.production` 文件，内容如下（使用您实际的数据库信息）：

```
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=您的数据库用户名
DB_PASSWORD=您的数据库密码
DB_DATABASE=您的数据库名称

# JWT密钥
JWT_SECRET=您的JWT密钥

# 网站基础URL（必须设置为您实际使用的域名）
NEXT_PUBLIC_BASE_URL=http://www.code.lookmori.cn

# 其他配置
NODE_ENV=production
```

> 注意：确保 NEXT_PUBLIC_BASE_URL 设置为您实际使用的域名，这关系到 Coze 授权重定向和其他功能的正常工作。

### 第五步：配置PM2启动脚本

在项目根目录创建 `ecosystem.config.js` 文件，内容如下：


#11
```javascript
module.exports = {
  apps: [
    {
      name: "your-app-name",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
```

### 第六步：使用PM2启动应用

1. 进入项目目录：`cd /www/wwwroot/your-app-name`
2. 使用PM2启动应用：`pm2 start ecosystem.config.js`
3. 配置PM2开机自启：`pm2 save && pm2 startup`

### 第七步：配置Nginx反向代理

1. 在宝塔面板中，点击"网站"
2. 点击"添加站点"
3. 填写域名、根目录等信息，根目录设为项目文件夹
4. 创建完成后，点击该网站的"设置"
5. 点击"配置文件"选项
6. 将Nginx配置修改为以下内容（记得替换相应的路径和域名）：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 静态资源缓存
    location /_next/static/ {
        alias /www/wwwroot/your-app-name/.next/static/;
        expires 30d;
        access_log off;
    }
    
    location /static/ {
        alias /www/wwwroot/your-app-name/public/;
        expires 30d;
        access_log off;
    }
}
```

7. 保存配置并重启Nginx

### 第八步：配置SSL证书（可选但推荐）

1. 在宝塔面板中，点击您的网站
2. 点击"SSL"选项
3. 可以选择"Let's Encrypt"免费证书
4. 填写必要信息并申请证书
5. 安装证书并开启强制HTTPS

### 第九步：验证部署

访问您的域名，确认应用已经正常运行。

## 常见问题排解

### 应用无法启动
- 检查日志：`pm2 logs`
- 确认端口是否被占用：`netstat -tln | grep 3000`
- 检查环境变量是否正确配置

### 数据库连接失败
- 检查数据库用户名和密码是否正确
- 确认数据库用户有访问权限
- 检查数据库防火墙设置

### Nginx配置问题
- 检查Nginx配置文件语法：`nginx -t`
- 查看Nginx错误日志：`tail -f /var/log/nginx/error.log`

## 更新应用程序

1. 进入项目目录：`cd /www/wwwroot/your-app-name`
2. 拉取最新代码：`git pull`
3. 安装依赖：`npm install --production`
4. 重新构建：`npm run build`
5. 重启应用：`pm2 restart your-app-name` 