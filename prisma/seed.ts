import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // 1. Cria um Grupo de Pesquisa inicial (DSML)
    const grupo = await prisma.grupoPesquisa.create({
        data: {
        nome: "G2BC - Grupo de Pesquisa em Bioinformática",
        missao: "Desenvolvimento de soluções computacionais aplicadas à biologia.",
        anoFormacao: 2020,
        }
    })

    // 2. Criptografa a senha do pesquisador de teste
    const hashedPassword = await bcrypt.hash('senha123', 10)

    // 3. Cria o usuário vinculado ao grupo criado
    const user = await prisma.user.create({
        data: {
        name: "Gabriel Rodrigues",
        email: "gabriel@uneb.br",
        password: hashedPassword,
        grupoId: grupo.id,
        }
    })

    console.log('✅ Banco populado com sucesso!')
    console.log(`👤 Usuário de teste criado: ${user.email} (Senha: senha123)`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })