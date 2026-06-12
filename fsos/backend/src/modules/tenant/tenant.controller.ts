import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('tenant')
export class TenantController {
  constructor(private readonly service: TenantService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.service.login(body.email, body.password);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile() {
    return { data: { message: 'Profile endpoint' } };
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getUsers() {
    return this.service.getUsers('current');
  }

  @Put('settings')
  @UseGuards(AuthGuard)
  async updateSettings(@Body() body: any) {
    return this.service.updateSettings('current', body.settings);
  }

  @Put('branding')
  @UseGuards(AuthGuard)
  async updateBranding(@Body() body: any) {
    return this.service.updateBranding('current', body);
  }
}
