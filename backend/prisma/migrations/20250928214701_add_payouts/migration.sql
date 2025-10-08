-- CreateTable
CREATE TABLE "public"."Payout" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "playCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Payout" ADD CONSTRAINT "Payout_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
