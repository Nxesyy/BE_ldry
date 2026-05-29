import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, LaundryStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalRevenueResult, pendingPayments, paidTransactions, totalOrders, activeOrders] = await Promise.all([
      // Total Pemasukan
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      // Pending Payment
      this.prisma.transaction.count({
        where: { paymentStatus: PaymentStatus.PENDING },
      }),
      // Pembayaran Order
      this.prisma.transaction.count({
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      // Total Order
      this.prisma.order.count(),
      // Belum Diambil(Not DIAMBIL)
      this.prisma.order.count({
        where: {
          status: { not: LaundryStatus.DIAMBIL },
        },
      }),
    ]);

    return {
      message: 'Dashboard statistics berhasil diambil',
      data: {
        totalRevenue: totalRevenueResult._sum.amount || 0,
        pendingPayments,
        paidTransactions,
        totalOrders,
        activeOrders,
      },
    };
  }
}
