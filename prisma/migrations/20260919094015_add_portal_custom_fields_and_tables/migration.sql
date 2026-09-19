-- AlterTable
ALTER TABLE "GrupoPesquisa" ADD COLUMN     "corPrimaria" TEXT DEFAULT '#2563eb',
ADD COLUMN     "corSecundaria" TEXT DEFAULT '#0284c7',
ADD COLUMN     "customSettings" JSONB,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "redesSociais" JSONB;

-- CreateTable
CREATE TABLE "Noticia" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT NOT NULL,
    "conteudo" TEXT,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link" TEXT,
    "grupoPesquisaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT,
    "link" TEXT,
    "grupoPesquisaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Noticia" ADD CONSTRAINT "Noticia_grupoPesquisaId_fkey" FOREIGN KEY ("grupoPesquisaId") REFERENCES "GrupoPesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_grupoPesquisaId_fkey" FOREIGN KEY ("grupoPesquisaId") REFERENCES "GrupoPesquisa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
