import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserLocale {
  en = 'en-us',
  uk = 'uk-ua',
  ru = 'ru-ua',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ nullable: true })
  locationKey: number;

  @Column({ type: 'enum', enum: UserLocale, default: UserLocale.en })
  locale: UserLocale;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
