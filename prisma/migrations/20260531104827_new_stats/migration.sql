/*
  Warnings:

  - The values [DICUCI,DISETRIKA] on the enum `OrderHistory_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [DICUCI,DISETRIKA] on the enum `OrderHistory_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Order` MODIFY `status` ENUM('DIPROSES', 'SELESAI', 'DIAMBIL') NOT NULL DEFAULT 'DIPROSES';

-- AlterTable
ALTER TABLE `OrderHistory` MODIFY `status` ENUM('DIPROSES', 'SELESAI', 'DIAMBIL') NOT NULL;
