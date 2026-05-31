import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsNumber, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsOptional()
  @Matches(/^(\+62|62|0)[0-9]{8,13}$/)
  phone?: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;
}
