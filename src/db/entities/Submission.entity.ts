import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

// 定义提交状态类型
export enum SubmissionStatus {
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PENDING = 'pending'
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid', { name: 'submission_id' })
  id!: string;

  @Column({ 
    type: 'uuid', 
    name: 'problem_id',
    nullable: false,
    comment: '问题ID' 
  })
  problemId!: string;

  @ManyToOne('Problem', 'submissions')
  @JoinColumn({ name: 'problem_id' })
  problem!: any;

  @Column({ 
    type: 'uuid', 
    name: 'user_id',
    nullable: false,
    comment: '用户ID' 
  })
  userId!: string;

  @ManyToOne('User', 'submissions')
  @JoinColumn({ name: 'user_id' })
  user!: any;

  @Column({ 
    type: 'text', 
    name: 'code_answer',
    nullable: false,
    comment: '代码答案' 
  })
  codeAnswer!: string;

  @CreateDateColumn({ 
    type: 'timestamp',
    name: 'submitted_at',
    comment: '提交时间' 
  })
  submittedAt!: Date;

  @Column({ 
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
    comment: '提交状态：正确、错误、等待中' 
  })
  status!: SubmissionStatus;

  @Column({ 
    type: 'float', 
    name: 'execution_time',
    nullable: true,
    comment: '执行时间（毫秒）' 
  })
  executionTime!: number;

  @Column({ 
    type: 'int', 
    name: 'memory_used',
    nullable: true,
    comment: '内存使用（字节）' 
  })
  memoryUsed!: number;

  @Column({ 
    type: 'text', 
    name: 'error_message',
    nullable: true,
    comment: '错误消息' 
  })
  errorMessage!: string;

  @Column({ 
    type: 'text', 
    name: 'evaluation_result',
    nullable: true,
    comment: '评估结果' 
  })
  evaluationResult!: string;
} 