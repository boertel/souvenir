/*
 SQLite does not support "Dropping foreign key" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
/*
 SQLite does not support "Changing existing column type" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/

ALTER TABLE entry ADD COLUMN s_next_review_at TEXT;
ALTER TABLE entry ADD COLUMN s_pinned_at TEXT;
ALTER TABLE entry ADD COLUMN s_created_at TEXT NOT NULL DEFAULT '2024-05-31 00:00:00.000';
ALTER TABLE entry ADD COLUMN s_updated_at TEXT NOT NULL DEFAULT '2024-05-31 00:00:00.000';

UPDATE entry SET
  s_next_review_at = CAST(next_review_at AS TEXT),
  s_pinned_at = CAST(pinned_at AS TEXT),
  s_created_at = CAST(created_at AS TEXT),
  s_updated_at = CAST(updated_at AS TEXT);

ALTER TABLE entry DROP COLUMN next_review_at;
ALTER TABLE entry DROP COLUMN pinned_at;
ALTER TABLE entry DROP COLUMN created_at;
ALTER TABLE entry DROP COLUMN updated_at;

ALTER TABLE entry RENAME COLUMN s_next_review_at TO next_review_at;
ALTER TABLE entry RENAME COLUMN s_pinned_at TO pinned_at;
ALTER TABLE entry RENAME COLUMN s_created_at TO created_at;
ALTER TABLE entry RENAME COLUMN s_updated_at TO updated_at;

-- practice table
ALTER TABLE practice ADD COLUMN s_created_at TEXT NOT NULL DEFAULT '2024-05-31 00:00:00.000';
ALTER TABLE practice ADD COLUMN s_updated_at TEXT NOT NULL DEFAULT '2024-05-31 00:00:00.000';

UPDATE practice SET
  s_created_at = CAST(created_at AS TEXT),
  s_updated_at = CAST(updated_at AS TEXT);

ALTER TABLE practice DROP COLUMN created_at;
ALTER TABLE practice DROP COLUMN updated_at;

ALTER TABLE practice RENAME COLUMN s_created_at TO created_at;
ALTER TABLE practice RENAME COLUMN s_updated_at TO updated_at;
