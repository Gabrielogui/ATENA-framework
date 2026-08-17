'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, AlertCircle, Sparkles } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (res?.error) {
            setError('E-mail ou senha incorretos.')
            setLoading(false)
            return
        }

        if (res?.ok) {
            router.push('/admin')
            router.refresh()
        }
        } catch {
        setError('Credenciais inválidas ou falha de comunicação com o servidor.')
        setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight text-white">
                        ATENA Framework
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Acesse o painel para gerenciar o portal do seu grupo
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-5 border-red-500/50 bg-red-950/40 text-red-300">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">
                                E-mail institucional
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="pesquisador@uneb.br"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-slate-800 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-200">
                                Senha de acesso
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-slate-800 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-600 font-medium text-white hover:bg-cyan-500 focus-visible:ring-cyan-500"
                        >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Autenticando...
                            </>
                        ) : (
                            'Acessar Painel'
                        )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
  )
}