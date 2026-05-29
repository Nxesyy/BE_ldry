import { IsEnum, IsNotEmpty } from 'class-validator';
import { LaundryStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'Status wajib diisi' })
  @IsEnum(LaundryStatus, { message: 'Status tidak valid' })
  status: LaundryStatus;
}
