import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertDocumentDto } from './dto/upsert-document.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.knowledgeDocument.findMany({ orderBy: { category: 'asc' } });
  }

  findBySlug(slug: string) {
    return this.prisma.knowledgeDocument.findUnique({ where: { slug } });
  }

  upsert(data: UpsertDocumentDto) {
    return this.prisma.knowledgeDocument.upsert({
      where: { slug: data.slug },
      update: { ...data },
      create: { ...data },
    });
  }

  delete(slug: string) {
    return this.prisma.knowledgeDocument.delete({ where: { slug } });
  }
}
