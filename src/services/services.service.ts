import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
  ) {}

  async create(businessId: string, dto: CreateServiceDto): Promise<Service> {
    const service = this.servicesRepository.create({ ...dto, businessId });
    return this.servicesRepository.save(service);
  }

  async findByBusiness(businessId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { businessId, isActive: true },
    });
  }

  async findOne(id: string, businessId: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id, businessId },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    return service;
  }

  async update(
    id: string,
    businessId: string,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.findOne(id, businessId);
    Object.assign(service, dto);
    return this.servicesRepository.save(service);
  }

  // Desactiva el servicio en vez de borrarlo para preservar historial de reservas
  async remove(id: string, businessId: string): Promise<void> {
    const service = await this.findOne(id, businessId);
    service.isActive = false;
    await this.servicesRepository.save(service);
  }
}
