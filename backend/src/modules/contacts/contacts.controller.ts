import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';

@Controller('contacts')
@UseGuards(AuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('stage') stage?: string,
    @Query('search') search?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.contactsService.findAll({ page, limit, status, stage, search, assignedTo });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.contactsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.contactsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  @Get(':id/household')
  async getHousehold(@Param('id') id: string) {
    return this.contactsService.getHouseholdMembers(id);
  }

  @Get(':id/policies')
  async getPolicies(@Param('id') id: string) {
    return this.contactsService.getPolicies(id);
  }

  @Get(':id/activity')
  async getActivity(@Param('id') id: string) {
    return this.contactsService.getActivity(id);
  }
}
