import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { LaundryStatus, PaymentStatus } from '@prisma/client';
import { generateOrderCode, generateTransactionCode } from '../common/utils/code-generator';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  private readonly statusSequence: LaundryStatus[] = [
    LaundryStatus.DIPROSES,
    LaundryStatus.DICUCI,
    LaundryStatus.DISETRIKA,
    LaundryStatus.SELESAI,
    LaundryStatus.DIAMBIL,
  ];

  async create(createOrderDto: CreateOrderDto) {
    const { userId, weight, totalPrice, paymentMethod } = createOrderDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }

    const orderCode = generateOrderCode();
    const transactionCode = generateTransactionCode();

    // Use Prisma $transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Create Order
      const order = await prisma.order.create({
        data: {
          orderCode,
          userId,
          weight,
          totalPrice,
          status: LaundryStatus.DIPROSES,
        },
      });

      // 2. Create Transaction
      await prisma.transaction.create({
        data: {
          transactionCode,
          orderId: order.id,
          amount: totalPrice,
          paymentMethod,
          paymentStatus: PaymentStatus.UNPAID,
        },
      });

      // 3. Create Order History
      await prisma.orderHistory.create({
        data: {
          orderId: order.id,
          status: LaundryStatus.DIPROSES,
        },
      });

      return order;
    });

    return {
      message: 'Order berhasil dibuat',
      data: result,
    };
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.orderCode = { contains: search };
    }
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        include: {
          customer: { select: { id: true, name: true, email: true } },
          transaction: true,
          histories: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      message: 'Data order berhasil diambil',
      data: {
        orders,
        meta: {
          total,
          page: Number(page),
          lastPage: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        transaction: true,
        histories: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
    }

    return {
      message: 'Data order berhasil diambil',
      data: order,
    };
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status: newStatus } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
    }

    const currentStatusIndex = this.statusSequence.indexOf(order.status);
    const newStatusIndex = this.statusSequence.indexOf(newStatus);

    // Validasi urutan status tidak boleh loncat
    if (newStatusIndex !== currentStatusIndex + 1 && newStatusIndex !== currentStatusIndex) {
      throw new BadRequestException(
        `Update status tidak valid. Status saat ini: ${order.status}, tidak bisa loncat ke ${newStatus}`
      );
    }

    if (currentStatusIndex === newStatusIndex) {
       return { message: 'Status order sudah berada pada tahap tersebut', data: order };
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      let dataToUpdate: any = { status: newStatus };
      
      if (newStatus === LaundryStatus.SELESAI) {
        dataToUpdate.finishedAt = new Date();
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: dataToUpdate,
      });

      await prisma.orderHistory.create({
        data: {
          orderId: id,
          status: newStatus,
        },
      });

      return updatedOrder;
    });

    return {
      message: `Status order berhasil diupdate menjadi ${newStatus}`,
      data: result,
    };
  }

  async remove(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.orderHistory.deleteMany({ where: { orderId: id } });
      await prisma.transaction.deleteMany({ where: { orderId: id } });
      await prisma.order.delete({ where: { id } });
    });

    return {
      message: 'Order berhasil dihapus',
      data: null,
    };
  }

  async getHistory(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order dengan ID ${id} tidak ditemukan`);
    }

    const histories = await this.prisma.orderHistory.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      message: 'History order berhasil diambil',
      data: histories,
    };
  }
}
