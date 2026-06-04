@Entity({
    name: 'slide'
})
export class Slide {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 2000 })
  content!: string;

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
  createdBy!: string;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  updatedBy!: string;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  deletedAt!: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'deleted_at',
  })
  deletedBy!: string;

  @OneToMany(() => SongSlide, (songSlide) => songSlide.slide)
  songSlides!: SongSlide[];
}