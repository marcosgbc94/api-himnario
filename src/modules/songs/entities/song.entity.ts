import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SongType } from './song-type.entity'; 

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

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
  })
  deletedAt!: Date;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'created_by',
  })
  createdBy!: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'updated_by',
  })
  updatedBy!: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'deleted_by',
  })
  deletedBy!: string;

  @OneToMany(() => SongSlide, (songSlide) => songSlide.song)
  songSlides!: SongSlide[];
}