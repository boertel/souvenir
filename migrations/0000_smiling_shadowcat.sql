CREATE TABLE `entry` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`parent_id` text,
	`child_id` text,
	`content` text NOT NULL,
	`repetition` integer DEFAULT 0,
	`interval` integer DEFAULT 0,
	`efactor` integer DEFAULT 2.5,
	`next_review_at` integer,
	`pinned_at` integer,
	`created_at` integer DEFAULT (datetime('now')) NOT NULL,
	`updated_at` integer DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `practice` (
	`id` text PRIMARY KEY NOT NULL,
	`entry_id` text NOT NULL,
	`grade` integer,
	`created_at` integer DEFAULT (datetime('now')) NOT NULL,
	`updated_at` integer DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`entry_id`) REFERENCES `entry`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`hashed_password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);