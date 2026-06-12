import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('pipeline')
@UseGuards(AuthGuard)
export class PipelinesController {
  constructor(private readonly service: PipelinesService) {}

  @Get('stages')
  async getStages() {
    return this.service.getStages();
  }

  @Get('deals')
  async getDeals(@Query('stageId') stageId?: string) {
    return this.service.getDeals(stageId);
  }

  @Post('deals')
  async createDeal(@Body() data: any) {
    return this.service.createDeal(data);
  }

  @Put('deals/:id')
  async updateDeal(@Param('id') id: string, @Body() data: any) {
    return this.service.updateDeal(id, data);
  }

  @Get('analytics')
  async getAnalytics() {
    return this.service.getPipelineAnalytics();
  }
}
