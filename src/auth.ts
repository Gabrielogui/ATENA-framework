import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
        name: "credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Senha", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null

            const user = await prisma.user.findUnique({
                where: { email: credentials.email as string },
                include: { grupo: true }
            })

            if (!user || !user.password) return null

            const isValid = await bcrypt.compare(
                credentials.password as string,
                user.password
            )

            if (!isValid) return null

            return {
                id: user.id,
                email: user.email,
                name: user.name,
                grupoId: user.grupoId,
                apiGrupoId: user.grupo?.apiGrupoId ?? null,
            }
        }
        })
    ],
})