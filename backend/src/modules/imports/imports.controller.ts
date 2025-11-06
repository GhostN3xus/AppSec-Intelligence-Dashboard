import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportsService } from './imports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

const csvFileValidator = new ParseFilePipe({
  validators: [new FileTypeValidator({ fileType: 'text/csv' })],
});

@Controller('import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('sast')
  @Roles(UserRole.admin, UserRole.analyst)
  @UseInterceptors(FileInterceptor('file'))
  importSast(@UploadedFile(csvFileValidator) file: Express.Multer.File, @Req() req: Request) {
    const user = req.user as any;
    return this.importsService.importSast(file.buffer, user?.sub, file.originalname);
  }

  @Post('sca')
  @Roles(UserRole.admin, UserRole.analyst)
  @UseInterceptors(FileInterceptor('file'))
  importSca(@UploadedFile(csvFileValidator) file: Express.Multer.File, @Req() req: Request) {
    const user = req.user as any;
    return this.importsService.importSca(file.buffer, user?.sub, file.originalname);
  }
}
