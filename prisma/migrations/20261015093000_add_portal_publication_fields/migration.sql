-- AlterTable
ALTER TABLE "GrupoPesquisa" ADD COLUMN "slug" TEXT,
ADD COLUMN "publicado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publicadoEm" TIMESTAMP(3),
ADD COLUMN "featuresSelecionadas" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "ordemSecoes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "GrupoPesquisa_slug_key" ON "GrupoPesquisa"("slug");
