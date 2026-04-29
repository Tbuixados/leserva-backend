import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { SetSchedulesDto } from './dto/set-schedules.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async set(businessId: string, dto: SetSchedulesDto): Promise<Schedule[]> {
    // Validar que opensAt sea menor que closesAt en cada día
    for (const item of dto.schedules) {
      if (item.opensAt >= item.closesAt) {
        throw new BadRequestException(
          `El horario del día ${item.dayOfWeek} es inválido: opensAt debe ser menor que closesAt`,
        );
      }
    }

    // Transacción: borra los horarios viejos e inserta los nuevos de forma atómica
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(Schedule, { businessId });
      const schedules = dto.schedules.map((item) =>
        manager.create(Schedule, { ...item, businessId }),
      );
      await manager.save(schedules);
    });

    return this.findByBusiness(businessId);
  }

  async findByBusiness(businessId: string): Promise<Schedule[]> {
    return this.schedulesRepository.find({
      where: { businessId },
      order: { dayOfWeek: 'ASC' },
    });
  }
}
