// src/reviews/reviews.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { BusinessesService } from '../businesses/businesses.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly businessesService: BusinessesService,
  ) {}

  // Pública: cualquiera puede ver las reseñas de un negocio
  @Get('business/:businessId')
  findByBusiness(@Param('businessId') businessId: string) {
    return this.reviewsService.findByBusiness(businessId);
  }

  // El cliente deja una reseña de un turno completado
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.create(user.id, dto);
  }

  // El negocio responde una reseña
  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard)
  async reply(
    @Param('id') id: string,
    @Body() dto: ReplyReviewDto,
    @CurrentUser() user: User,
  ) {
    const business = await this.businessesService.findByUserId(user.id);
    return this.reviewsService.reply(id, business.id, dto);
  }
}
