CREATE TABLE `deployed_address` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `account` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`));
