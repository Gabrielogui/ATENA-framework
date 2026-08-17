import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface User {
        grupoId?: string | null
    }

    interface Session {
        user: {
        grupoId?: string | null
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        grupoId?: string | null
    }
}