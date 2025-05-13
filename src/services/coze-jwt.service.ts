import { SubmitCodeRequest, SubmitCodeResponse, SubmissionStatus } from '@/types/practice';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // 需要安装依赖: npm install uuid @types/uuid

/**
 * Coze JWT服务 - 处理与Coze API的JWT认证方式交互
 */
export class CozeJwtService {
  // Coze JWT配置
  private static readonly CLIENT_TYPE = 'jwt';
  private static readonly CLIENT_ID = '1119333527611';
  private static readonly COZE_WWW_BASE = 'https://www.coze.cn';
  private static readonly COZE_API_BASE = 'https://api.coze.cn';
  private static readonly PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDkcDK40uoHSBFh
USfyl/XItuluJQmBMcVaxTfU+HWXhrSNVwsV80nbXnbVi4o5dvWQwzxTaio4St+x
e2HnpzGFCTNdTtkLK72VwnfMNH7gY1pIgeMTTFnCvdUZN3WlV/PBzHbifC4+lif0
+B6ij2XyQxgENuBzavSKdowzWDj7TMaOOtUCFDJ/Ua+PsedUQUK/hJ4bmF18Fuu0
twzCyp1EO+BuIW8E57XN/ZLZZfk8aco26vW5TKjhHHLEO6UdOCGGPEwJnDk4vSZM
yF8M7ptewid6gV2wfhNstk8oUAtRzq8AbD2HHnC64hstXfcgA1WA6z6+vKE0E9w0
zA++XCPtAgMBAAECggEAMHn80Yr0nen1wjyaKRmFT3w9aiHS9AcvVdVfRUMalTbB
TvMnR5ey1yojNqrfgNVVREyiGyN+5SZCdSP1QVcSI6SxsT3fwkace1Di4kNLn2uG
B7gEi55auABX3fuObDGPaVNt8R8gIyjzPsF+osmifTguuwo4NFYAofeJRgYVRYJ9
L1a0qi0/pKEqHx5JCKO7SvJ4R0oVh/uMIUGe+6qW3A3VFd04c7QAMwQABtb31MFp
c+MoiwzNHZTzq5V97vb+R+YFGHzH12fFskYyg9CU6C6K2bCMX2S0txPVtRZ3FeQU
me3MGne2/SejSmi20OXszJnr6smMYbUithODY1yQowKBgQD8XHQRR5+qu9tJwGA5
ul/u0wLktXnQKeZWcPvJEeVi/Cm8uhn9nndF7rgkYRVsHSVcjlpeQzWp3/MIt5la
79lGiJGdARiJRaIYbbOOyEZoawrHsOZgMTiP6aiahCn3tziXS5jFAYYObo2nm4AH
ztTBawGnTG2hKA3p+Om4X4GILwKBgQDnu3AMLC1jqOd83B0mZo4/YMM7VN1wfBe2
colnW+9en8mX9dkbG6RR4uTPho2FvJcelZD/dXneOSV9JXQIJEdV5g3FQDLo7RWa
jsy3RVO9+k6btVTk2c57DshegWkyG4IaNabSvZNG2JUNkI9XMAj8r05Q8U0qYQ47
JDemlrryowKBgQChrY3C4FM/7BjCuFgtw+TgOhoZcta28ZEbgkkdebSvZQRMYCJ0
pQifKiCZVgWGfWnJUX498+s2iT7IL/A1HYLjOG2p2+DfWVhPNEEcUd0h2qpOY1xE
9mPZd4ZIcDH+/UhpTcpzNNWw+00Pu4Ub+3u86xRlHYcC/4lig9EhCTcQiwKBgGRl
D1kmto9ruMaecj6VxeDtYgfNb5ZxHLDdlGvkJ6NeJK+iQmn9IsabPzgtehjLqMkG
UWhrk93T8krys/9nAETVw3eGpcfGF0r7vPNVpL80t2O8PshbGJq1v9c5x8J+qnIC
doDswua5pHHZBFDorawToyFsOVs36ztyKG4S9XFzAoGAKz6NuPfij/MwLPH+JuCb
4qz3fEZu1QLTFTEkC+Fi27GffEorpUBgEZ+vUyVJxhIZ7VO4OpeTrDEOPZfdjAYH
I4RsAUvqmZrnG+UTjT/A1H6jgnnDSOjCzSAMD/kVdJm+mhPS2tMX2fABcSZOkyd8
aJZ9XnCES3xxZhS8hUT8ryQ=
-----END PRIVATE KEY-----`;
  private static readonly PUBLIC_KEY_ID = 'CF3IvZ3VQarqvnO4X4E5r1BjHuFHwXO6XQpCHpYh8hQ';
  
  // Coze OAuth2令牌端点
  private static readonly TOKEN_ENDPOINT = `${CozeJwtService.COZE_API_BASE}/api/permission/oauth2/token`;
  
  // Coze工作流配置
  private static readonly WORKFLOW_ID = '7476350823728218175'; // 代码评估工作流ID
  private static readonly WORKFLOW_ENDPOINT = `${CozeJwtService.COZE_API_BASE}/v1/workflow/run`; // 正确的工作流端点路径
  
  // 缓存access_token，避免频繁请求
  private static accessToken: string | null = null;
  private static accessTokenExpiry: number = 0;
  
  /**
   * 生成JWT令牌
   * @param expSeconds 过期时间（秒）
   * @returns JWT令牌
   */
  private static generateJwtToken(expSeconds: number = 3600): string {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      // 确保包含jti字段
      const payload = {
        iss: this.CLIENT_ID,
        iat: now,
        exp: now + expSeconds,
        aud: 'api.coze.cn',
        jti: uuidv4() // 添加唯一标识符
      };
      
      // 确保header包含正确的alg和kid字段
      const options: jwt.SignOptions = {
        algorithm: 'RS256',
        header: {
          alg: 'RS256',
          kid: this.PUBLIC_KEY_ID
        }
      };
      
      // 打印JWT令牌生成信息，用于调试
      console.log('正在生成JWT令牌，参数:', {
        iss: payload.iss,
        exp: payload.exp,
        aud: payload.aud,
        jti: payload.jti, // 记录jti
        kid: options.header?.kid
      });
      
      const token = jwt.sign(payload, this.PRIVATE_KEY, options);
      console.log('JWT令牌生成成功，长度:', token?.length || 0);
      return token;
    } catch (error) {
      console.error('生成JWT令牌失败:', error);
      throw new Error('生成JWT令牌失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  /**
   * 获取OAuth2 access_token
   * @returns access_token
   */
  private static async getAccessToken(): Promise<string> {
    // 检查缓存的token是否有效
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.accessTokenExpiry > now + 60) { // 提前60秒刷新
      return this.accessToken;
    }
    
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        // 生成JWT令牌，确保每次使用不同的jti
        const jwtToken = this.generateJwtToken(600); // 设置为10分钟有效期，与示例一致
        
        console.log(`正在获取Coze access_token... (尝试 ${retryCount + 1}/${maxRetries + 1})`);
        console.log('请求URL:', this.TOKEN_ENDPOINT);
        console.log('JWT令牌前50个字符:', jwtToken.substring(0, 50) + '...');
        
        // 请求access_token
        const response = await fetch(this.TOKEN_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            duration_seconds: 86399, // 24小时有效期
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer'
          }),
        });
        
        const responseText = await response.text();
        console.log('响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = JSON.parse(responseText);
            console.log('错误响应内容:', errorData);
          } catch (e) {
            console.log('原始错误响应:', responseText);
            errorData = { error: responseText };
          }
          
          // 如果是最后一次重试，则抛出错误
          if (retryCount === maxRetries) {
            throw new Error(`获取access_token失败: ${response.statusText} - ${JSON.stringify(errorData)}`);
          }
          
          // 否则继续重试
          retryCount++;
          console.log(`等待 ${retryCount}秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          continue;
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log('成功获取access_token，有效期:', data.expires_in);
        } catch (e) {
          throw new Error('解析access_token响应失败: ' + responseText);
        }
        
        if (!data.access_token) {
          throw new Error('获取access_token失败: 响应中没有token');
        }
        
        // 缓存token，过期时间设置略短于服务器给定的时间
        this.accessToken = data.access_token;
        this.accessTokenExpiry = now + (data.expires_in || 86399) - 300; // 提前5分钟过期
        
        return data.access_token;
      } catch (error) {
        console.error(`获取access_token失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        if (retryCount === maxRetries) {
          throw error;
        }
        
        retryCount++;
        console.log(`等待 ${retryCount}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
      }
    }
    
    // 这行代码理论上不会执行，但TypeScript需要返回值
    throw new Error('无法获取access_token: 已超过最大重试次数');
  }
  
  /**
   * 提交代码到Coze工作流
   * @param request 提交请求，包含用户ID、问题ID和代码
   * @returns 提交结果
   */
  public static async submitCode(request: SubmitCodeRequest): Promise<SubmitCodeResponse> {
    try {
      // 确保用户ID存在
      const userId = request.userId || 'anonymous-user';
      
      // 获取access_token
      const accessToken = await this.getAccessToken();
      
      // 准备请求参数
      const payload = {
        parameters: {
          ques_desc: request.problemDescription || request.problemId, // 优先使用详细描述，如果没有则使用ID
          ques_ans: request.code // 学生提交的代码
        },
        workflow_id: this.WORKFLOW_ID
      };
      
      console.log('调用Coze工作流，参数:', {
        endpoint: this.WORKFLOW_ENDPOINT,
        workflowId: this.WORKFLOW_ID,
        tokenLength: accessToken.length,
        hasDescription: !!request.problemDescription,
        codeLength: request.code.length,
        userId: userId // 记录用户ID
      });
      
      // 调用工作流
      const response = await fetch(this.WORKFLOW_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      
      // 获取响应内容
      const responseText = await response.text();
      console.log('工作流响应状态:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: responseText };
        }
        console.error('代码提交失败:', errorData);
        
        // 如果是令牌无效错误，清除缓存并重试一次
        if (response.status === 401 || 
            errorData.code === 700012006 || // access token invalid
            (errorData.msg && typeof errorData.msg === 'string' && errorData.msg.includes('token'))) {
          console.log('Access token无效，重新获取token并重试...');
          
          // 清除缓存的token
          this.accessToken = null;
          this.accessTokenExpiry = 0;
          
          // 重新获取token
          const newAccessToken = await this.getAccessToken();
          
          // 重试请求
          const retryResponse = await fetch(this.WORKFLOW_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newAccessToken}`,
            },
            body: JSON.stringify(payload),
          });
          
          // 获取重试响应内容
          const retryResponseText = await retryResponse.text();
          console.log('工作流重试响应状态:', retryResponse.status, retryResponse.statusText);
          
          if (!retryResponse.ok) {
            let retryErrorData: any = {};
            try {
              retryErrorData = JSON.parse(retryResponseText);
            } catch (e) {
              retryErrorData = { error: retryResponseText };
            }
            console.error('重试提交代码失败:', retryErrorData);
            
            return {
              success: false,
              error: retryErrorData.msg || retryErrorData.message || '代码提交失败，请稍后重试'
            };
          }
          
          let retryData;
          try {
            retryData = JSON.parse(retryResponseText);
          } catch (e) {
            console.error('解析工作流重试响应失败:', e);
            return {
              success: false,
              error: '解析工作流响应失败: ' + retryResponseText
            };
          }
          
          // 处理工作流结果
          return this.processWorkflowResult(retryData, request, userId);
        }
        
        return {
          success: false,
          error: errorData.msg || errorData.message || '代码提交失败，请稍后重试'
        };
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('解析工作流响应失败:', e);
        return {
          success: false,
          error: '解析工作流响应失败: ' + responseText
        };
      }
      
      // 处理工作流结果
      return this.processWorkflowResult(data, request, userId);
      
    } catch (error: any) {
      console.error('提交代码时发生错误:', error);
      return {
        success: false,
        error: error.message || '代码提交失败，请稍后重试'
      };
    }
  }
  
  /**
   * 处理工作流结果，直接获取code_status和code_error
   * @param data 工作流返回数据
   * @param request 原始请求
   * @param userId 用户ID
   * @returns 处理后的响应
   */
  private static processWorkflowResult(data: any, request: SubmitCodeRequest, userId: string): SubmitCodeResponse {
    console.log('工作流原始结果:', JSON.stringify(data, null, 2));
    
    // 提取输出信息
    let codeStatus = false;
    let codeError = '';
    let evaluationResult = '';
    
    // 首先检查data.data字段（Coze API返回的格式）
    if (data && data.data && typeof data.data === 'string') {
      try {
        const parsedData = JSON.parse(data.data);
        if (parsedData) {
          codeStatus = !!parsedData.code_status;
          codeError = parsedData.code_error || '';
          evaluationResult = parsedData.code_error || JSON.stringify(parsedData);
          console.log('从data.data提取信息:', { codeStatus, codeError });
        }
      } catch (e) {
        console.error('解析data.data失败:', e);
      }
    }
    
    // 如果data.data没有提供足够信息，再尝试从output中提取
    if (!codeError && !codeStatus && data.output) {
      const output = data.output;
      
      // 尝试解析输出
      if (typeof output === 'string') {
        try {
          const parsedOutput = JSON.parse(output);
          codeStatus = !!parsedOutput.code_status;
          codeError = parsedOutput.code_error || '';
          if (!evaluationResult) {
            evaluationResult = parsedOutput.code_error || JSON.stringify(parsedOutput);
          }
          console.log('从output(字符串)提取信息:', { codeStatus, codeError });
        } catch (e) {
          // 如果不是JSON，使用原始字符串作为评估结果
          if (!evaluationResult) {
            evaluationResult = output;
          }
        }
      } else if (output && typeof output === 'object') {
        // 如果output是对象，直接获取code_status和code_error
        codeStatus = !!output.code_status;
        codeError = output.code_error || '';
        if (!evaluationResult) {
          evaluationResult = output.code_error || JSON.stringify(output);
        }
        console.log('从output(对象)提取信息:', { codeStatus, codeError });
      }
    }
    
    // 确定状态
    const status = codeStatus ? 
      SubmissionStatus.CORRECT : 
      SubmissionStatus.INCORRECT;
    
    console.log('工作流结果解析:', {
      codeStatus,
      codeError,
      status,
      userId: userId
    });
    
    return {
      success: true,
      submission: {
        id: data.id || 'temp-' + Date.now(),
        problemId: request.problemId,
        userId: userId, // 使用传入的用户ID
        codeAnswer: request.code,
        submittedAt: new Date().toISOString(),
        status: status,
        executionTime: data.output?.execution_time || 0,
        memoryUsed: data.output?.memory_used || 0,
        errorMessage: codeError, // 使用解析后的codeError
        evaluationResult: evaluationResult // 使用评估结果或错误信息
      }
    };
  }
} 