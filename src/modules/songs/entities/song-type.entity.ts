import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Song } from './song.entity';

@Entity({
  name: 'song_types',
})
export class SongType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128 })
  type!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  // Primer argumento Entitdad, segundo argumento propiedad dentro de la Entidad
  @OneToMany(() => Song, (song) => song.songType)
  songs!: Song[];
}
