import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  findAll() {
    return this.applicationsService.findAll();
  }

  @Get('top-critical')
  getTop(@Query('limit') limit?: string) {
    return this.applicationsService.getTopCritical(limit ? parseInt(limit, 10) : 10);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateApplicationDto) {
    return this.applicationsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateApplicationDto) {
    return this.applicationsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
