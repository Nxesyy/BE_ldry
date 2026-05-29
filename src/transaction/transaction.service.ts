import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 10, paymentStatus } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: {
          order: {
            include: {
              customer: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      message: 'Data transaksi berhasil diambil',
      data: {
        transactions,
        meta: {
          total,
          page: Number(page),
          lastPage: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    return {
      message: 'Data transaksi berhasil diambil',
      data: transaction,
    };
  }

  async uploadProof(id: number, filePath: string) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    if (transaction.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Transaksi ini sudah lunas, tidak perlu upload bukti lagi');
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        paymentProof: filePath,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    return {
      message: 'Bukti pembayaran berhasil diupload, menunggu konfirmasi Admin',
      data: updatedTransaction,
    };
  }

  async approve(id: number) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    if (transaction.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Transaksi ini sudah berstatus PAID');
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
      },
    });

    return {
      message: 'Pembayaran berhasil disetujui (PAID)',
      data: updatedTransaction,
    };
  }

  async reject(id: number) {
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    if (transaction.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Transaksi yang sudah PAID tidak bisa di-reject');
    }

    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.REJECTED,
      },
    });

    return {
      message: 'Pembayaran ditolak (REJECTED)',
      data: updatedTransaction,
    };
  }
}
