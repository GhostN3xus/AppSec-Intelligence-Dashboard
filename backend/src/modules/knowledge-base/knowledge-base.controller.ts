import { Body, Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { UpsertDocumentDto } from './dto/upsert-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('knowledge-base')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get()
  list() {
    return this.knowledgeBaseService.list();
  }

  @Get(':slug')
  find(@Param('slug') slug: string) {
    return this.knowledgeBaseService.findBySlug(slug);
  }

  @Put(':slug')
  upsert(@Param('slug') slug: string, @Body() body: UpsertDocumentDto) {
    return this.knowledgeBaseService.upsert({ ...body, slug });
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.knowledgeBaseService.delete(slug);
  }
}
