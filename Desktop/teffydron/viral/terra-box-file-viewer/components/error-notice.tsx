import { KeyRound, TriangleAlert } from 'lucide-react'

export function ErrorNotice({
  code,
  message,
}: {
  code: 'missing_cookie' | 'auth' | 'request'
  message: string
}) {
  const needsCookie = code === 'missing_cookie' || code === 'auth'
  const Icon = needsCookie ? KeyRound : TriangleAlert

  return (
    <section className="rounded-xl border bg-background p-6 md:p-8" role="alert">
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-pretty">{message}</h2>
          {needsCookie && (
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Inicia sesión en terabox.com desde tu navegador.</li>
              <li>
                Abre las herramientas de desarrollador (F12) → Aplicación / Almacenamiento → Cookies
                → https://www.terabox.com.
              </li>
              <li>
                Copia el valor de la cookie <code className="rounded bg-muted px-1 font-mono">ndus</code>.
              </li>
              <li>
                Pégalo en la variable{' '}
                <code className="rounded bg-muted px-1 font-mono">TERABOX_NDUS</code> desde
                Configuración → Vars.
              </li>
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}
