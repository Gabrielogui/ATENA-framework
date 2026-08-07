-- CreateTable
CREATE TABLE "GrupoPesquisa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "anoFormacao" INTEGER,
    "situacao" TEXT,
    "repercussao" TEXT,
    "missao" TEXT,
    "sobre" TEXT,
    "contato" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrupoPesquisa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pesquisador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "formacaoAcademica" TEXT,
    "lattesId" TEXT NOT NULL,
    "grupoPesquisaId" TEXT NOT NULL,

    CONSTRAINT "Pesquisador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pesquisador" ADD CONSTRAINT "Pesquisador_grupoPesquisaId_fkey" FOREIGN KEY ("grupoPesquisaId") REFERENCES "GrupoPesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
