import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('resend.apiKey'));
    this.fromEmail =
      this.configService.get<string>('resend.fromEmail') ??
      'onboarding@resend.dev';
  }

  async sendAppointmentConfirmation(data: {
    clientEmail: string;
    clientName: string;
    businessName: string;
    date: string;
    startTime: string;
    serviceName: string;
    professionalName: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: 'data.clientEmail',
        subject: `Turno confirmado en ${data.businessName}`,
        html: `
          <h2>¡Tu turno fue confirmado!</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu turno en <strong>${data.businessName}</strong> fue confirmado.</p>
          <ul>
            <li><strong>Servicio:</strong> ${data.serviceName}</li>
            <li><strong>Profesional:</strong> ${data.professionalName}</li>
            <li><strong>Fecha:</strong> ${data.date}</li>
            <li><strong>Horario:</strong> ${data.startTime}</li>
          </ul>
          <p>¡Te esperamos!</p>
        `,
      });
    } catch (error) {
      this.logger.error('Error enviando email de confirmación', error);
    }
  }

  async sendAppointmentPending(data: {
    clientEmail: string;
    clientName: string;
    businessName: string;
    date: string;
    startTime: string;
    serviceName: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: 'data.clientEmail',
        subject: `Turno pendiente en ${data.businessName}`,
        html: `
          <h2>Turno pendiente de confirmación</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu solicitud de turno en <strong>${data.businessName}</strong> está pendiente de confirmación.</p>
          <ul>
            <li><strong>Servicio:</strong> ${data.serviceName}</li>
            <li><strong>Fecha:</strong> ${data.date}</li>
            <li><strong>Horario:</strong> ${data.startTime}</li>
          </ul>
          <p>Te avisaremos cuando el negocio confirme tu turno.</p>
        `,
      });
    } catch (error) {
      this.logger.error('Error enviando email de turno pendiente', error);
    }
  }

  async sendNewAppointmentToBusiness(data: {
    businessEmail: string;
    businessName: string;
    clientName: string;
    date: string;
    startTime: string;
    serviceName: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: 'data.businessEmail',
        subject: `Nueva solicitud de turno — ${data.clientName}`,
        html: `
          <h2>Nueva solicitud de turno</h2>
          <p>Hola ${data.businessName},</p>
          <p><strong>${data.clientName}</strong> quiere reservar un turno.</p>
          <ul>
            <li><strong>Servicio:</strong> ${data.serviceName}</li>
            <li><strong>Fecha:</strong> ${data.date}</li>
            <li><strong>Horario:</strong> ${data.startTime}</li>
          </ul>
          <p>Ingresá a tu panel para confirmar o rechazar el turno.</p>
        `,
      });
    } catch (error) {
      this.logger.error('Error enviando email al negocio', error);
    }
  }

  async sendEmailVerification(data: {
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.email,
        subject: 'Verificá tu cuenta en Leserva',
        html: `
        <h2>Bienvenido a Leserva, ${data.name}!</h2>
        <p>Para activar tu cuenta hacé click en el siguiente link:</p>
        <a href="${process.env.FRONTEND_URL}/auth/verify?token=${data.token}">
          Verificar mi cuenta
        </a>
        <p>Este link expira en 24 horas.</p>
        <p>Si no creaste una cuenta en Leserva ignorá este email.</p>
      `,
      });
    } catch (error) {
      this.logger.error('Error enviando email de verificación', error);
    }
  }
}
