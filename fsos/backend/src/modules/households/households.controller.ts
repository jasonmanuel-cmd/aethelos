import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { HouseholdsService } from './households.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('households')
@UseGuards(AuthGuard)
export class HouseholdsController {
  constructor(private readonly service: HouseholdsService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return this.service.findAll(page, limit, search);
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
