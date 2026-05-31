import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'User ID wajib diisi' })
  @IsNumber({}, { message: 'User ID harus berupa angka' })
  userId!: number;

  @IsNotEmpty({ message: 'Berat (kg) wajib diisi' })
  @IsNumber({}, { message: 'Berat harus berupa angka' })
  weight!: number;

  @IsNotEmpty({ message: 'Total harga wajib diisi' })
  @IsNumber({}, { message: 'Total harga harus berupa angka' })
  totalPrice!: number;

  @IsNotEmpty({ message: 'Metode pembayaran wajib diisi' })
  @IsString()
  paymentMethod!: string;
}
