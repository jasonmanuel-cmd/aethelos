import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('policies')
@UseGuards(AuthGuard)
export class PoliciesController {
  constructor(private readonly service: PoliciesService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 20,
    @Query('lob') lob?: string, @Query('status') status?: string) {
    return this.service.findAll(page, limit, lob, status);
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
