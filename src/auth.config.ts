import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: { strategy: "jwt" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user
        const isOnAdmin = nextUrl.pathname.startsWith('/admin')
        
        if (isOnAdmin) {
            if (isLoggedIn) return true
            return false // Redireciona não autenticados para /login
        }
        return true
        },
        async jwt({ token, user }) {
        if (user) {
            token.grupoId = (user as any).grupoId
        }
        return token
        },
        async session({ session, token }) {
        if (session.user) {
            (session.user as any).grupoId = token.grupoId
        }
        return session
        },
    },
    providers: [], // Fica vazio aqui; os providers com Node.js entram no auth.ts
} satisfies NextAuthConfig