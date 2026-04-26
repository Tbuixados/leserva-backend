import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ConfirmationMode {
  MANUAL = 'manual',
  AUTO = 'auto',
}

export enum BusinessPlan {
  FREE = 'free',
  PRO = 'pro',
}

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ type: 'float', nullable: true })
  lat!: number;

  @Column({ type: 'float', nullable: true })
  lng!: number;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl!: string;

  @Column({
    name: 'confirmation_mode',
    type: 'enum',
    enum: ConfirmationMode,
    default: ConfirmationMode.MANUAL,
  })
  confirmationMode!: ConfirmationMode;

  @Column({
    type: 'enum',
    enum: BusinessPlan,
    default: BusinessPlan.FREE,
  })
  plan!: BusinessPlan;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'plan_expires_at', nullable: true })
  planExpiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
