import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('assessments')
@UseGuards(AuthGuard)
export class AssessmentsController {
  constructor(private readonly service: AssessmentsService) {}

  @Get('templates')
  async getTemplates() {
    return this.service.getTemplates();
  }

  @Post('start/:contactId')
  async startAssessment(@Param('contactId') contactId: string, @Body() body: { templateId?: string }) {
    return this.service.createAssessment(contactId, body.templateId);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string, @Body() body: { responses: Record<string, any> }) {
    return this.service.submitAssessment(id, body.responses);
  }

  @Get('contact/:contactId')
  async getByContact(@Param('contactId') contactId: string) {
    return this.service.getContactAssessments(contactId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.service.getAssessment(id);
  }
}
