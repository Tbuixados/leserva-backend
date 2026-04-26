import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessesRepository: Repository<Business>,
  ) {}

  async create(userId: string, dto: CreateBusinessDto): Promise<Business> {
    const existing = await this.businessesRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException(
        'Este usuario ya tiene un negocio registrado',
      );
    }

    const slug = dto.slug
      ? await this.validateCustomSlug(dto.slug)
      : await this.findUniqueSlug(dto.name);

    const business = this.businessesRepository.create({
      ...dto,
      userId,
      slug,
    });

    return this.businessesRepository.save(business);
  }

  async findByUserId(userId: string): Promise<Business> {
    const business = await this.businessesRepository.findOne({
      where: { userId },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return business;
  }

  async findBySlug(slug: string): Promise<Business> {
    const business = await this.businessesRepository.findOne({
      where: { slug },
    });

    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    return business;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  private async findUniqueSlug(name: string): Promise<string> {
    const base = this.generateSlug(name);
    let slug = base;
    let counter = 2;

    while (await this.businessesRepository.findOne({ where: { slug } })) {
      slug = `${base}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async validateCustomSlug(slug: string): Promise<string> {
    const existing = await this.businessesRepository.findOne({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException(`El slug "${slug}" ya está en uso`);
    }
    return slug;
  }
}
