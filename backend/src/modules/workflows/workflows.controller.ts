import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('workflows')
@UseGuards(AuthGuard)
export class WorkflowsController {
  constructor(private readonly service: WorkflowsService) {}

  @Get('templates')
  async getTemplates() {
    return this.service.getTemplates();
  }

  @Post('templates')
  async createTemplate(@Body() data: any) {
    return this.service.createTemplate(data);
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() data: any) {
    return this.service.updateTemplate(id, data);
  }

  @Post(':templateId/execute/:contactId')
  async execute(@Param('templateId') templateId: string, @Param('contactId') contactId: string) {
    return this.service.executeWorkflow(templateId, contactId);
  }

  @Get('instances')
  async getInstances(@Body('templateId') templateId?: string) {
    return this.service.getInstances(templateId);
  }

  @Get('instances/:id')
  async getInstance(@Param('id') id: string) {
    return this.service.getInstance(id);
  }
}
