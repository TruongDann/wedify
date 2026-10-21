CREATE TABLE `template_categories` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `template_categories_name_key`(`name`),
  UNIQUE INDEX `template_categories_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `template_styles` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `sortOrder` INTEGER NOT NULL DEFAULT 0,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `template_styles_name_key`(`name`),
  UNIQUE INDEX `template_styles_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `template_categories` (`id`, `name`, `slug`, `updatedAt`)
SELECT UUID(), source.`category`, LOWER(REPLACE(TRIM(source.`category`), ' ', '-')), CURRENT_TIMESTAMP(3)
FROM (SELECT DISTINCT `category` FROM `templates`) source;

INSERT INTO `template_styles` (`id`, `name`, `slug`, `updatedAt`)
SELECT UUID(), source.`style`, LOWER(REPLACE(TRIM(source.`style`), ' ', '-')), CURRENT_TIMESTAMP(3)
FROM (SELECT DISTINCT `style` FROM `templates` WHERE `style` IS NOT NULL AND `style` <> '') source;

ALTER TABLE `templates` ADD COLUMN `categoryId` VARCHAR(191) NULL, ADD COLUMN `styleId` VARCHAR(191) NULL;
UPDATE `templates` t JOIN `template_categories` c ON c.`name` = t.`category` SET t.`categoryId` = c.`id`;
UPDATE `templates` t LEFT JOIN `template_styles` s ON s.`name` = t.`style` SET t.`styleId` = s.`id`;
ALTER TABLE `templates` MODIFY `categoryId` VARCHAR(191) NOT NULL, DROP COLUMN `category`, DROP COLUMN `style`;
CREATE INDEX `templates_categoryId_idx` ON `templates`(`categoryId`);
CREATE INDEX `templates_styleId_idx` ON `templates`(`styleId`);
ALTER TABLE `templates` ADD CONSTRAINT `templates_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `template_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `templates` ADD CONSTRAINT `templates_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `template_styles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
