import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { Service } from '../services/entities/service.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import {
  Business,
  ConfirmationMode,
} from '../businesses/entities/business.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AvailableSlotsDto } from './dto/available-slots.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Professional)
    private readonly professionalsRepository: Repository<Professional>,
    @InjectRepository(Service)
    private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Schedule)
    private readonly schedulesRepository: Repository<Schedule>,
    @InjectRepository(Business)
    private readonly businessesRepository: Repository<Business>,
  ) {}

  async getAvailableSlots(dto: AvailableSlotsDto): Promise<string[]> {
    const professional = await this.professionalsRepository.findOne({
      where: { id: dto.professionalId, isActive: true },
    });

    if (!professional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    const service = await this.servicesRepository.findOne({
      where: { id: dto.serviceId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Obtener el día de la semana de la fecha pedida (0=domingo, 6=sábado)
    const date = new Date(dto.date + 'T00:00:00');
    const dayOfWeek = date.getDay();

    const schedule = await this.schedulesRepository.findOne({
      where: { businessId: professional.businessId, dayOfWeek },
    });

    if (!schedule) {
      return []; // El negocio no trabaja ese día
    }

    // Generar todos los slots posibles en el rango de horario
    const slots = this.generateSlots(
      schedule.opensAt,
      schedule.closesAt,
      service.durationMinutes,
    );

    // Buscar reservas existentes del profesional en esa fecha
    const existingAppointments = await this.appointmentsRepository.find({
      where: {
        professionalId: dto.professionalId,
        date: dto.date,
        status: In([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]),
      },
    });

    // Filtrar slots que se solapan con reservas existentes
    return slots.filter((slot) => {
      const slotStart = this.timeToMinutes(slot);
      const slotEnd = slotStart + service.durationMinutes;

      return !existingAppointments.some((appt) => {
        const apptStart = this.timeToMinutes(appt.startTime);
        const apptEnd = this.timeToMinutes(appt.endTime);
        // Hay solapamiento si el slot empieza antes que termine la reserva
        // y termina después que empiece la reserva
        return slotStart < apptEnd && slotEnd > apptStart;
      });
    });
  }

  async create(
    clientId: string,
    dto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const service = await this.servicesRepository.findOne({
      where: { id: dto.serviceId, isActive: true },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    const professional = await this.professionalsRepository.findOne({
      where: { id: dto.professionalId, isActive: true },
    });

    if (!professional) {
      throw new NotFoundException('Profesional no encontrado');
    }

    // Verificar que el slot sigue disponible antes de crear la reserva
    const availableSlots = await this.getAvailableSlots({
      professionalId: dto.professionalId,
      serviceId: dto.serviceId,
      date: dto.date,
    });

    if (!availableSlots.includes(dto.startTime)) {
      throw new BadRequestException(
        'El horario seleccionado no está disponible',
      );
    }

    // Calcular endTime sumando la duración del servicio al startTime
    const endTime = this.minutesToTime(
      this.timeToMinutes(dto.startTime) + service.durationMinutes,
    );

    const business = await this.businessesRepository.findOne({
      where: { id: professional.businessId },
    });

    // Si el negocio tiene confirmación automática, confirmar directo
    const status =
      business?.confirmationMode === ConfirmationMode.AUTO
        ? AppointmentStatus.CONFIRMED
        : AppointmentStatus.PENDING;

    const appointment = this.appointmentsRepository.create({
      clientId,
      professionalId: dto.professionalId,
      serviceId: dto.serviceId,
      businessId: professional.businessId,
      date: dto.date,
      startTime: dto.startTime,
      endTime,
      notes: dto.notes,
      status,
    });

    return this.appointmentsRepository.save(appointment);
  }

  async findByBusiness(businessId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { businessId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async findByClient(clientId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { clientId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  async updateStatus(
    id: string,
    status: AppointmentStatus,
    userId: string,
    businessId?: string,
  ): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Reserva no encontrada');
    }

    // Solo el negocio puede confirmar o completar
    if (
      [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED].includes(
        status,
      ) &&
      appointment.businessId !== businessId
    ) {
      throw new ForbiddenException(
        'No tenés permiso para realizar esta acción',
      );
    }

    // El cliente solo puede cancelar sus propias reservas
    if (
      status === AppointmentStatus.CANCELLED &&
      appointment.clientId !== userId &&
      appointment.businessId !== businessId
    ) {
      throw new ForbiddenException(
        'No tenés permiso para cancelar esta reserva',
      );
    }

    appointment.status = status;
    return this.appointmentsRepository.save(appointment);
  }

  // Genera slots de tiempo cada durationMinutes dentro del rango de horario
  private generateSlots(
    opensAt: string,
    closesAt: string,
    durationMinutes: number,
  ): string[] {
    const slots: string[] = [];
    let current = this.timeToMinutes(opensAt);
    const end = this.timeToMinutes(closesAt);

    while (current + durationMinutes <= end) {
      slots.push(this.minutesToTime(current));
      current += durationMinutes;
    }

    return slots;
  }

  // Convierte "09:30" a 570 (minutos desde medianoche)
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convierte 570 a "09:30"
  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
