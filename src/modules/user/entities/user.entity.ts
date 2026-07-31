import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {UserLocale} from "../../../common/enums/locale.enum";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'bigint' })
  userId: number;

  @Column({ default: 347629 })
  locationKey: number;

  @Column({ type: 'enum', enum: UserLocale, default: UserLocale.EN })
  locale: UserLocale;

  @Column({ type: 'varchar', nullable: true, default: null })
  waitingFor: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
