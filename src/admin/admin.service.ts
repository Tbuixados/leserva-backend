import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business, BusinessPlan } from '../businesses/entities/business.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessesRepository: Repository<Business>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async getMetrics() {
    const [totalUsers, totalBusinesses, totalAppointments, proBusinesses] =
      await Promise.all([
        this.usersRepository.count(),
        this.businessesRepository.count(),
        this.appointmentsRepository.count(),
        this.businessesRepository.count({ where: { plan: BusinessPlan.PRO } }),
      ]);

    return {
      totalUsers,
      totalBusinesses,
      totalAppointments,
      proBusinesses,
      freeBusinesses: totalBusinesses - proBusinesses,
    };
  }

  async findAllBusinesses() {
    return this.businessesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllUsers() {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  async toggleBusinessStatus(id: string): Promise<Business> {
    const business = await this.businessesRepository.findOne({ where: { id } });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    business.isActive = !business.isActive;
    return this.businessesRepository.save(business);
  }
}
