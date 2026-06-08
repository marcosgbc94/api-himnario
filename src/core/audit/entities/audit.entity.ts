import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  action!: string;

  @Column({ type: 'varchar', length: 16 })
  method!: string;

  @Column({ type: 'varchar', length: 255 })
  url!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload!: any;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip!: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
