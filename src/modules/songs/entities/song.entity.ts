import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SongType } from './song-type.entity';
import { SongSlide } from './song-slide.entity';

@Entity({
  name: 'songs',
})
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => SongType, { eager: false })
  @JoinColumn({ name: 'id_song_type' })
  songType!: SongType;

  @Column({ type: 'varchar', length: 256 })
  title!: string;

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'summary' })
  summary?: string;

  /**
   * AUDITORÍA
   */

  @Column({ type: 'boolean', default: true })
  active!: boolean;

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

  @OneToMany(() => SongSlide, (songSlide) => songSlide.song)
  songSlides!: SongSlide[];
}
