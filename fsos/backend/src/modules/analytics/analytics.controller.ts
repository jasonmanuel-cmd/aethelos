import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.service.getDashboard();
  }

  @Get('lead-sources')
  async getLeadSources() {
    return this.service.getLeadSourceAnalytics();
  }

  @Get('agent-performance')
  async getAgentPerformance() {
    return this.service.getAgentPerformance();
  }

  @Get('forecast')
  async getForecast() {
    return this.service.getRevenueForecast();
  }
}
