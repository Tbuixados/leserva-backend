import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Appointment)
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment;

  @Column({ name: 'appointment_id', unique: true })
  appointmentId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client!: User;

  @Column({ name: 'client_id' })
  clientId!: string;

  @ManyToOne(() => Business)
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @Column({ name: 'business_id' })
  businessId!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ nullable: true })
  comment!: string;

  @Column({ name: 'business_reply', nullable: true })
  businessReply!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
