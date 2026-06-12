import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { XDateService } from './xdate.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('xdates')
@UseGuards(AuthGuard)
export class XDateController {
  constructor(private readonly service: XDateService) {}

  @Get()
  async findAll(
    @Query('page') page = 1, @Query('limit') limit = 20,
    @Query('status') status?: string, @Query('tenantId') tenantId?: string,
  ) {
    return this.service.findAll(tenantId || 'all', page, limit, status);
  }

  @Get('upcoming')
  async getUpcoming(@Query('days') days = 60) {
    return this.service.getUpcoming('current', days);
  }

  @Get('cross-sell')
  async getCrossSell() {
    return this.service.getCrossSellOpportunities('current');
  }

  @Post(':id/pause')
  async pause(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.service.pauseSequence(id, body.reason);
  }

  @Post(':id/resume')
  async resume(@Param('id') id: string) {
    return this.service.resumeSequence(id);
  }
}
