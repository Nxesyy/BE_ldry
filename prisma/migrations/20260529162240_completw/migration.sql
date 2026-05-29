/*
  Warnings:

  - You are about to drop the column `estimatedFinish` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isFinishedNotif` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerKg` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `serviceType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderCode` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Order_invoiceCode_key` ON `Order`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `estimatedFinish`,
    DROP COLUMN `invoiceCode`,
    DROP COLUMN `isFinishedNotif`,
    DROP COLUMN `pricePerKg`,
    DROP COLUMN `serviceType`,
    ADD COLUMN `orderCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `phone`,
    MODIFY `role` ENUM('ADMIN', 'CUSTOMER', 'ROOT') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `OrderHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `status` ENUM('DIPROSES', 'DICUCI', 'DISETRIKA', 'SELESAI', 'DIAMBIL') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionCode` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `paymentStatus` ENUM('UNPAID', 'PENDING', 'PAID', 'REJECTED') NOT NULL DEFAULT 'UNPAID',
    `paymentMethod` VARCHAR(191) NOT NULL,
    `paymentProof` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `orderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Transaction_transactionCode_key`(`transactionCode`),
    UNIQUE INDEX `Transaction_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Order_orderCode_key` ON `Order`(`orderCode`);

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
