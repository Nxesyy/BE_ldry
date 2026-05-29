import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const { name, email, password } = createAdminDto;

    const emailExists = await this.prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new ConflictException('Email sudah digunakan');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN, // Force role ADMIN
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return {
      message: 'Admin berhasil ditambahkan',
      data: admin,
    };
  }

  async findAll() {
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return {
      message: 'Data admin berhasil diambil',
      data: admins,
    };
  }

  async findOne(id: number) {
    const admin = await this.prisma.user.findFirst({
      where: { id, role: Role.ADMIN },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin dengan ID ${id} tidak ditemukan`);
    }

    return {
      message: 'Data admin berhasil diambil',
      data: admin,
    };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.prisma.user.findFirst({ where: { id, role: Role.ADMIN } });
    if (!admin) {
      throw new NotFoundException(`Admin dengan ID ${id} tidak ditemukan`);
    }

    if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateAdminDto.email },
      });
      if (emailExists) {
        throw new ConflictException('Email sudah digunakan oleh user lain');
      }
    }

    const dataToUpdate: any = { ...updateAdminDto };
    if (updateAdminDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    const updatedAdmin = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });

    return {
      message: 'Data admin berhasil diupdate',
      data: updatedAdmin,
    };
  }

  async remove(id: number) {
    const admin = await this.prisma.user.findFirst({ where: { id, role: Role.ADMIN } });
    if (!admin) {
      throw new NotFoundException(`Admin dengan ID ${id} tidak ditemukan`);
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      message: 'Admin berhasil dihapus',
      data: null,
    };
  }
}
