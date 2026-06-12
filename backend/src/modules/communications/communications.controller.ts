import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommunicationsService } from './communications.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('communications')
@UseGuards(AuthGuard)
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Get()
  async getLogs(@Query('contactId') contactId?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.getLogs(contactId, page, limit);
  }

  @Post('send')
  async send(@Body() data: any) {
    return this.service.sendCommunication(data);
  }

  @Get('stats')
  async getStats() {
    return this.service.getStats();
  }
}
