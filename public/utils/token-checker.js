/**
 * JWT Token检查工具
 * 
 * 在浏览器控制台中可以运行以下命令来获取和检查JWT令牌：
 * 
 * const script = document.createElement('script');
 * script.src = '/utils/token-checker.js';
 * document.body.appendChild(script);
 * 
 * 然后运行:
 * checkToken();
 */

// 获取当前存储的令牌
function getToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

// 分析JWT令牌结构
function decodeToken(token) {
  if (!token) {
    console.error('❌ 未找到令牌');
    return null;
  }
  
  try {
    // JWT格式: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ 令牌格式不正确');
      return null;
    }
    
    // 解码payload部分 (第二部分)
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('❌ 解码令牌失败:', error);
    return null;
  }
}

// 检查令牌是否有效
function checkToken() {
  const token = getToken();
  console.log('当前令牌:', token);
  
  if (!token) {
    console.error('❌ 未找到令牌 - 请先登录');
    return;
  }
  
  const payload = decodeToken(token);
  if (!payload) return;
  
  console.log('令牌payload:', payload);
  
  // 检查过期时间
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    console.error(`❌ 令牌已过期。过期时间: ${new Date(payload.exp * 1000).toLocaleString()}`);
  } else if (payload.exp) {
    console.log(`✅ 令牌有效。过期时间: ${new Date(payload.exp * 1000).toLocaleString()}`);
  }
  
  // 检查用户角色
  if (payload.role) {
    console.log(`用户角色: ${payload.role} ${payload.role === 'admin' ? '(✅ 是管理员)' : '(❌ 不是管理员)'}`);
  } else {
    console.warn('⚠️ 令牌中没有角色信息');
  }
  
  // 返回解码后的payload，以便进一步检查
  return payload;
}

// 测试向问题批量API发送请求
async function testProblemBatchApi() {
  const token = getToken();
  if (!token) {
    console.error('❌ 未找到令牌 - 请先登录');
    return;
  }
  
  try {
    console.log('开始测试批量创建问题API...');
    
    // 示例问题数据
    const testProblems = [{
      problem_name: "测试问题",
      problem_description: "这是一个测试问题描述",
      example_input: "示例输入",
      example_output: "示例输出",
      ques_tag: "测试"
    }];
    
    const response = await fetch('/api/problems/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ problems: testProblems })
    });
    
    console.log('API响应状态:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('API响应数据:', data);
    
    if (response.ok) {
      console.log('✅ API请求成功');
    } else {
      console.error('❌ API请求失败:', data.error);
    }
    
    return data;
  } catch (error) {
    console.error('❌ API请求异常:', error);
  }
}

// 将这些函数暴露到全局作用域
window.getToken = getToken;
window.decodeToken = decodeToken;
window.checkToken = checkToken;
window.testProblemBatchApi = testProblemBatchApi; 