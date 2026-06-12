import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('agents')
@UseGuards(AuthGuard)
export class AgentsController {
  constructor(private readonly service: AgentsService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Get(':id/conversations')
  async getConversations(@Param('id') id: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.getConversations(id, page, limit);
  }

  @Post(':id/trigger/:contactId')
  async trigger(@Param('id') id: string, @Param('contactId') contactId: string) {
    return this.service.triggerAgent(id, contactId);
  }
}
