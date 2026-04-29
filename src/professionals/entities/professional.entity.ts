import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from '../../businesses/entities/business.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('professionals')
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_id' })
  business!: Business;

  @Column({ name: 'business_id' })
  businessId!: string;

  @Column()
  name!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl!: string;

  // Servicios que puede realizar este profesional
  @ManyToMany(() => Service, { eager: true })
  @JoinTable({
    name: 'professional_services',
    joinColumn: { name: 'professional_id' },
    inverseJoinColumn: { name: 'service_id' },
  })
  services!: Service[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
