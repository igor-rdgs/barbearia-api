-- DropForeignKey
ALTER TABLE "public"."BarberSchedule" DROP CONSTRAINT "BarberSchedule_barberId_fkey";

-- AddForeignKey
ALTER TABLE "BarberSchedule" ADD CONSTRAINT "BarberSchedule_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
