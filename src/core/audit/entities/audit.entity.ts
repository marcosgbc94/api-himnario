import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  userId!: string;

  @Column()
  action!: string;

  @Column()
  method!: string;

  @Column()
  url!: string;

  @Column('jsonb', { nullable: true })
  payload!: any;

  @Column({ nullable: true })
  ip!: string;

  @CreateDateColumn()
  createdAt!: Date;
}