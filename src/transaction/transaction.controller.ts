import { Controller, Get, Patch, Param, UseGuards, Query, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/utils/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.transactionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.findOne(id);
  }

  @Post(':id/upload-proof')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadProof(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File gambar wajib diupload');
    }
    const filePath = `/uploads/${file.filename}`;
    return this.transactionService.uploadProof(id, filePath);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.transactionService.reject(id);
  }
}
