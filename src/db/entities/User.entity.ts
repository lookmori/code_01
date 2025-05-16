import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  BeforeInsert,
  OneToMany
} from 'typeorm';
import { hashSync } from 'bcrypt';

// 定义用户角色类型
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id!: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    unique: true,
    comment: '用户名' 
  })
  username!: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false, 
    unique: true,
    comment: '邮箱地址' 
  })
  email!: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false,
    comment: '密码（加密存储）' 
  })
  password!: string;

  @Column({ 
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
    comment: '用户角色：学生、管理员'
  })
  role!: UserRole;

  @CreateDateColumn({ 
    type: 'timestamp',
    name: 'created_at',
    comment: '注册时间' 
  })
  createdAt!: Date;

  @UpdateDateColumn({ 
    type: 'timestamp',
    name: 'updated_at',
    comment: '最后更新时间' 
  })
  updatedAt!: Date;

  // 与评论的关系
  @OneToMany('Comment', 'user')
  comments!: any[];

  // 与提交的关系
  @OneToMany('Submission', 'user')
  submissions!: any[];

  constructor() {
    this.role = UserRole.STUDENT;
  }

  // 在保存前对密码进行哈希处理
  @BeforeInsert()
  hashPassword() {
    if (this.password) {
      this.password = hashSync(this.password, 10);
    }
  }
} 