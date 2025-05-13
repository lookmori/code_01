/**
 * 管理员帮助工具脚本
 * 
 * 在浏览器控制台中可以运行以下命令来获取管理员权限：
 * 
 * const script = document.createElement('script');
 * script.src = '/utils/admin-helper.js';
 * document.body.appendChild(script);
 * 
 * 然后运行:
 * makeAdmin();
 */

// 将当前用户设置为管理员
function makeAdmin() {
  try {
    // 从本地存储中获取当前用户
    let userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) {
      console.error('未找到已登录用户');
      return false;
    }

    // 解析用户对象
    const user = JSON.parse(userStr);
    console.log('当前用户:', user);

    // 设置为管理员角色
    const adminUser = { ...user, role: 'admin' };
    console.log('设置为管理员后:', adminUser);

    // 保存回存储
    const adminUserJson = JSON.stringify(adminUser);
    
    if (localStorage.getItem('user')) {
      localStorage.setItem('user', adminUserJson);
    } else if (sessionStorage.getItem('user')) {
      sessionStorage.setItem('user', adminUserJson);
    }

    // 触发自定义事件通知应用状态变化
    window.dispatchEvent(new CustomEvent('auth_state_change', {
      detail: { isAuthenticated: true, user: adminUser }
    }));

    console.log('✅ 已成功将用户设置为管理员，请刷新页面');
    return true;
  } catch (error) {
    console.error('设置管理员权限失败:', error);
    return false;
  }
}

// 检查当前用户是否为管理员
function checkAdmin() {
  try {
    // 从本地存储中获取当前用户
    let userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userStr) {
      console.log('❌ 未找到已登录用户');
      return false;
    }

    // 解析用户对象
    const user = JSON.parse(userStr);
    const isAdmin = user.role === 'admin';
    
    console.log('当前用户:', user);
    console.log('角色:', user.role);
    console.log(isAdmin ? '✅ 当前用户是管理员' : '❌ 当前用户不是管理员');
    
    return isAdmin;
  } catch (error) {
    console.error('检查管理员状态失败:', error);
    return false;
  }
}

// 将这些函数暴露到全局作用域
window.makeAdmin = makeAdmin;
window.checkAdmin = checkAdmin; 