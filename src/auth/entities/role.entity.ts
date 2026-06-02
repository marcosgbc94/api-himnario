import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from './user-role.entity';
import { RoleSlugEnum } from '../enums/role-slug.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'enum', enum: RoleSlugEnum, unique: true })
  slug: RoleSlugEnum;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}