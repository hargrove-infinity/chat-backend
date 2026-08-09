UPDATE "users"
SET "name" = trim(concat_ws(' ', "first_name", "last_name"))
WHERE "name" IS NULL;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";