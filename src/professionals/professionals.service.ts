import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';
import { Service } from '../services/entities/service.entity';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private readonly professionalsRepository: Repository<Professional>,
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async create(
    businessId: string,
    dto: CreateProfessionalDto,
  ): Promise<Professional> {
    const professional = this.professionalsRepository.create({
      name: dto.name,
      avatarUrl: dto.avatarUrl,
      businessId,
    });

    if (dto.serviceIds?.length) {
      professional.services = await this.servicesRepository.findBy({
        id: In(dto.serviceIds),
        businessId,
      });
    }

    return this.professionalsRepository.save(professional);
  }

  async findByBusiness(businessId: string): Promise<Professional[]> {
    return this.professionalsRepository.find({
      where: { businessId, isActive: true },
    });
  }

  async findOne(id: string, businessId: string): Promise<Professional> {
    const professional = await this.professionalsRepository.findOne({
      where: { id, businessId },
    });

    if (!professional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    return professional;
  }

  async update(
    id: string,
    businessId: string,
    dto: UpdateProfessionalDto,
  ): Promise<Professional> {
    const professional = await this.findOne(id, businessId);

    const { serviceIds, ...rest } = dto;
    Object.assign(professional, rest);

    if (serviceIds?.length) {
      professional.services = await this.servicesRepository.findBy({
        id: In(serviceIds),
        businessId,
      });
    }

    return this.professionalsRepository.save(professional);
  }

  async remove(id: string, businessId: string): Promise<void> {
    const professional = await this.findOne(id, businessId);
    professional.isActive = false;
    await this.professionalsRepository.save(professional);
  }
}
