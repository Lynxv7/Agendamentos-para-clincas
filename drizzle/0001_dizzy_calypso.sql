ALTER TABLE "appointments" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "clinic_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "patient_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "appointments" ALTER COLUMN "doctor_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "clinics" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "doctors" ALTER COLUMN "clinic_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "patients" ALTER COLUMN "clinic_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "users_to_clinics" ALTER COLUMN "clinic_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "appointment_price_in_cents" integer NOT NULL;