import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CarriersService } from './carriers.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('carriers')
@UseGuards(AuthGuard)
export class CarriersController {
  constructor(private readonly service: CarriersService) {}

  @Get()
  async findAll(@Query('all') all?: string) {
    return this.service.findAll(all !== 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.service.create(data);
  }
}
