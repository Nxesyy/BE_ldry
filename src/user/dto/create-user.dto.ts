import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsNotEmpty({ message: 'Nomor telepon wajib diisi' })
  @IsNumber()
  phone!: number;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;
}
