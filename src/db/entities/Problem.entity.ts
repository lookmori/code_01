import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn,
  OneToMany
} from 'typeorm';

@Entity('problems')
export class Problem {
  @PrimaryGeneratedColumn('uuid', { name: 'problem_id' })
  id!: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    comment: '问题名称' 
  })
  problemName!: string;

  @Column({ 
    type: 'text', 
    nullable: false,
    comment: '问题描述' 
  })
  problemDescription!: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: '示例输入' 
  })
  exampleInput!: string;

  @Column({ 
    type: 'text', 
    nullable: true,
    comment: '示例输出' 
  })
  exampleOutput!: string;

  @Column({ 
    type: 'json', 
    name: 'tag',
    nullable: true,
    comment: '问题标签' 
  })
  tag!: string;

  @CreateDateColumn({ 
    type: 'timestamp',
    name: 'published_at',
    comment: '发布时间' 
  })
  publishedAt!: Date;

  // 与评论的关系 - 使用类型字符串避免循环依赖
  @OneToMany('Comment', 'problem')
  comments!: any[];

  // 与提交的关系 - 使用类型字符串避免循环依赖
  @OneToMany('Submission', 'problem')
  submissions!: any[];
} 