import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid', { name: 'comment_id' })
  id!: string;

  @Column({ 
    type: 'uuid', 
    name: 'problem_id',
    nullable: false,
    comment: '所属问题ID' 
  })
  problemId!: string;

  @ManyToOne('Problem', 'comments')
  @JoinColumn({ name: 'problem_id' })
  problem!: any;

  @Column({ 
    type: 'uuid', 
    name: 'user_id',
    nullable: false,
    comment: '评论用户ID' 
  })
  userId!: string;

  @ManyToOne('User', 'comments')
  @JoinColumn({ name: 'user_id' })
  user!: any;

  @Column({ 
    type: 'text', 
    nullable: false,
    comment: '评论内容' 
  })
  content!: string;

  @Column({ 
    type: 'boolean', 
    name: 'has_code',
    default: false,
    comment: '是否包含代码' 
  })
  hasCode!: boolean;

  @Column({ 
    type: 'text', 
    name: 'code_block',
    nullable: true,
    comment: '代码块内容' 
  })
  codeBlock!: string;

  @Column({ 
    type: 'varchar', 
    name: 'code_language',
    length: 50,
    nullable: true,
    comment: '代码语言' 
  })
  codeLanguage!: string;

  @Column({ 
    type: 'uuid', 
    name: 'parent_id',
    nullable: true,
    comment: '父评论ID' 
  })
  parentId!: string | null;

  @ManyToOne('Comment', 'comments')
  @JoinColumn({ name: 'parent_id' })
  parentComment!: any;

  @Column({ 
    type: 'uuid', 
    name: 'quoted_comment_id',
    nullable: true,
    comment: '引用评论ID' 
  })
  quotedCommentId!: string | null;

  @Column({ 
    type: 'int', 
    default: 0,
    comment: '评论层级' 
  })
  level!: number;

  @Column({ 
    type: 'int', 
    name: 'replies_count',
    default: 0,
    comment: '回复数量' 
  })
  repliesCount!: number;

  @Column({ 
    type: 'int', 
    name: 'likes_count',
    default: 0,
    comment: '点赞数量' 
  })
  likesCount!: number;

  @CreateDateColumn({ 
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间' 
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    type: 'timestamp',
    name: 'updated_at',
    comment: '更新时间' 
  })
  updatedAt!: Date;
} 