import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import configuration from './config/configuration';
import { Business } from './businesses/entities/business.entity';
import { BusinessesModule } from './businesses/businesses.module';
import { Category } from './categories/entities/category.entity';
import { CategoriesModule } from './categories/categories.module';
import { Service } from './services/entities/service.entity';
import { ServicesModule } from './services/services.module';
import { Professional } from './professionals/entities/professional.entity';
import { ProfessionalsModule } from './professionals/professionals.module';
import { Schedule } from './schedules/entities/schedule.entity';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get<number>('database.port'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        entities: [User, Business, Category, Service, Professional, Schedule],
        migrations: [],
        synchronize: process.env.NODE_ENV === 'development',
        logging: config.get('app.env') === 'development',
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    AuthModule,
    UsersModule,
    BusinessesModule,
    CategoriesModule,
    ServicesModule,
    ProfessionalsModule,
    SchedulesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
