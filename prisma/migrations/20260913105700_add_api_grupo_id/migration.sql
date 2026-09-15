-- AlterTable
ALTER TABLE "GrupoPesquisa" ADD COLUMN "apiGrupoId" TEXT,
ADD COLUMN "dgpId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GrupoPesquisa_apiGrupoId_key" ON "GrupoPesquisa"("apiGrupoId");
