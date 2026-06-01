import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'roles',
})
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  slug: string;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  observation: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'created_by',
  })
  createdBy: string;
}
