// src/admin/admin.controller.ts
import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Métricas globales del sistema
  @Get('metrics')
  getMetrics() {
    return this.adminService.getMetrics();
  }

  // Lista todos los negocios
  @Get('businesses')
  findAllBusinesses() {
    return this.adminService.findAllBusinesses();
  }

  // Lista todos los usuarios
  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  // Activa o suspende un negocio
  @Patch('businesses/:id/toggle')
  toggleBusinessStatus(@Param('id') id: string) {
    return this.adminService.toggleBusinessStatus(id);
  }
}
