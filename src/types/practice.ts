/**
 * 问题接口定义
 */
export interface Problem {
  id: string;
  problemName: string;
  problemDescription: string;
  exampleInput?: string;
  exampleOutput?: string;
  tag?: string[];
  publishedAt: string;
  
  // 前端兼容字段
  title?: string;
  description?: string;
  tags?: string[] | any[];
  difficulty?: string;
  example_input?: string;
  example_output?: string;
  sampleInput?: string;
  sampleOutput?: string;
  problem_description?: string;
}

/**
 * 提交状态枚举
 */
export enum SubmissionStatus {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PENDING = 'pending'
}

/**
 * 提交接口定义
 */
export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  codeAnswer: string;
  submittedAt: string;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  errorMessage?: string;
  evaluationResult?: string;
  problem?: Problem;
  user?: {
    id: string;
    username: string;
  };
}

/**
 * 提交代码请求接口
 */
export interface SubmitCodeRequest {
  problemId: string;
  code: string;
  problemDescription?: string;
  userId?: string;
}

/**
 * 提交代码响应接口
 */
export interface SubmitCodeResponse {
  success: boolean;
  submission?: Submission;
  error?: string;
}

/**
 * 用户基本信息
 */
export interface UserInfo {
  id: string;
  username: string;
}

/**
 * 引用评论信息
 */
export interface QuotedComment {
  id: string;
  content: string;
  user?: UserInfo;
}

/**
 * 评论接口定义
 */
export interface Comment {
  id: string;
  problemId: string;
  userId: string;
  content: string;
  hasCode: boolean;
  codeBlock?: string;
  codeLanguage?: string;
  parentId?: string;
  quotedCommentId?: string;
  level: number;
  repliesCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user?: UserInfo;
  quotedComment?: QuotedComment;
}

/**
 * 添加评论请求接口
 */
export interface AddCommentRequest {
  problemId: string;
  content: string;
  hasCode?: boolean;
  codeBlock?: string;
  codeLanguage?: string;
  parentId?: string;
  quotedCommentId?: string;
}

/**
 * 添加评论响应接口
 */
export interface AddCommentResponse {
  success: boolean;
  comment?: Comment;
  error?: string;
}

export interface ProblemTag {
  id: string;
  name: string;
  color: string;
}

export interface PaginatedProblems {
  problems: Problem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ProblemSearchParams {
  page: number;
  pageSize: number;
  search?: string;
  difficulty?: string;
  tags?: string[];
} 