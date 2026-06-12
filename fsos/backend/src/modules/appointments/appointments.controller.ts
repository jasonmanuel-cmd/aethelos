import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20,
    @Query('status') status?: string, @Query('assignedTo') assignedTo?: string) {
    return this.service.findAll(page, limit, status, assignedTo);
  }

  @Get('today')
  async getToday() {
    return this.service.getTodayAppointments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }
}
