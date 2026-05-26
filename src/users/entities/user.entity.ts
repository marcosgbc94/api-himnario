import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude() // Excluye el campo password de las respuestas JSON, pero lo mantiene en la entidad para validación y transformación
  password: string;

  @Column({ type: 'varchar', length: 255 })
  names: string;

  @Column({ type: 'varchar', length: 255, name: 'last_names' })
  lastNames: string;

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

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'updated_by',
  })
  updatedBy: string;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
  })
  deletedAt: Date;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'deleted_by',
  })
  deletedBy: string;

  // Antes de insertar un nuevo usuario en la base de datos, se ejecuta este método para hashear la contraseña antes de guardarla
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
