-- AlterTable
ALTER TABLE `affiliate_partners` ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false;
