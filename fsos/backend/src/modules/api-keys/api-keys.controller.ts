import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { Request } from 'express';

@Controller('api-keys')
@UseGuards(AuthGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  async getAll(@Req() req: Request) {
    const tenantId = (req as any).user?.tenantId;
    return this.apiKeysService.getKeys(tenantId);
  }

  @Get(':service')
  async getOne(@Req() req: Request, @Param('service') service: string) {
    const tenantId = (req as any).user?.tenantId;
    return this.apiKeysService.getKey(tenantId, service);
  }

  @Post(':service')
  async upsert(
    @Req() req: Request,
    @Param('service') service: string,
    @Body() body: { api_key?: string; api_secret?: string; config_json?: Record<string, any> }
  ) {
    const tenantId = (req as any).user?.tenantId;
    return this.apiKeysService.upsertKey(tenantId, service, body);
  }

  @Delete(':service')
  async remove(@Req() req: Request, @Param('service') service: string) {
    const tenantId = (req as any).user?.tenantId;
    return this.apiKeysService.deleteKey(tenantId, service);
  }
}
