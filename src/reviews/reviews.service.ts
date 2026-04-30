import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../appointments/entities/appointment.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(clientId: string, dto: CreateReviewDto): Promise<Review> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: dto.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Turno no encontrado');
    }

    if (appointment.clientId !== clientId) {
      throw new ForbiddenException(
        'No podés dejar una reseña de un turno ajeno',
      );
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Solo podés dejar reseñas de turnos completados',
      );
    }

    const existing = await this.reviewsRepository.findOne({
      where: { appointmentId: dto.appointmentId },
    });

    if (existing) {
      throw new BadRequestException('Ya dejaste una reseña para este turno');
    }

    const review = this.reviewsRepository.create({
      appointmentId: dto.appointmentId,
      clientId,
      businessId: appointment.businessId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.reviewsRepository.save(review);
  }

  async findByBusiness(
    businessId: string,
  ): Promise<{ reviews: Review[]; average: number }> {
    const reviews = await this.reviewsRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      reviews,
      average: Math.round(average * 10) / 10, // Redondea a 1 decimal
    };
  }

  async reply(
    id: string,
    businessId: string,
    dto: ReplyReviewDto,
  ): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id } });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    if (review.businessId !== businessId) {
      throw new ForbiddenException(
        'No podés responder reseñas de otro negocio',
      );
    }

    review.businessReply = dto.reply;
    return this.reviewsRepository.save(review);
  }
}
