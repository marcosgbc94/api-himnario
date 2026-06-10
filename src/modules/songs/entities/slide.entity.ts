import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { SongSlide } from './song-slide.entity';

@Entity({
  name: 'slide',
})
export class Slide {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 2000 })
  content!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  /**
   * AUDITORÍA
   */

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt!: Date;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'created_by',
  })
  createdBy!: string | null;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    nullable: true,
  })
  updatedAt!: Date | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'updated_by',
  })
  updatedBy!: string | null;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
    nullable: true,
  })
  deletedAt!: Date | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'deleted_by',
  })
  deletedBy!: string | null;

  @OneToMany(() => SongSlide, (songSlide) => songSlide.slide)
  songSlides!: SongSlide[];
}
