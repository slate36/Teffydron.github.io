import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = { title: 'Términos de Uso | Polo' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Términos de Uso" subtitle="Condiciones de uso de la plataforma" />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <article className="space-y-8">
            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Al acceder y usar Polo, aceptas estos términos de uso y nuestra política de privacidad.
                Si no estás de acuerdo con estos términos, por favor no uses esta plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Polo es una plataforma online que permite:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Navegar y acceder a videos almacenados en TeraBox</li>
                <li>Crear una cuenta de usuario personalizada</li>
                <li>Publicar contenido relacionado con el mundo del polo</li>
                <li>Comentar en publicaciones de otros usuarios</li>
                <li>Dar me gusta a publicaciones</li>
                <li>Generar códigos QR para compartir contenido</li>
                <li>Interactuar con la comunidad mediante hashtags y menciones</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">3. Registro y Cuenta</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">3.1 Creación de Cuenta</h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    Para crear una cuenta, debes:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Ser mayor de 13 años</li>
                    <li>Proporcionar información verídica y actualizada</li>
                    <li>Mantener la seguridad de tu contraseña</li>
                    <li>Notificarnos inmediatamente de cualquier uso no autorizado de tu cuenta</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3.2 Responsabilidad</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Eres responsable de todas las actividades que ocurren en tu cuenta. Polo no se hace responsable
                    por pérdidas derivadas del uso no autorizado de tu cuenta.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">4. Contenido del Usuario</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">4.1 Lo que Puedes Publicar</h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    Puedes publicar contenido relacionado con el mundo del polo, incluyendo:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Revistas y publicaciones sobre polo</li>
                    <li>Sitios web de clubes y torneos</li>
                    <li>Enlaces a videos y contenido relevante</li>
                    <li>Información sobre torneos y eventos</li>
                    <li>Menciones a jugadores y equipos</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.2 Contenido Prohibido</h3>
                  <p className="text-muted-foreground mb-2 leading-relaxed">
                    No puedes publicar contenido que:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Sea ilegal o viole leyes uruguayas</li>
                    <li>Contenga spam, publicidad no autorizada o malware</li>
                    <li>Sea ofensivo, discriminatorio o de odio</li>
                    <li>Violate derechos de autor o propiedad intelectual</li>
                    <li>Contenga información personal de terceros sin consentimiento</li>
                    <li>Sea pornográfico o inapropiado</li>
                    <li>Promueva violencia o conductas ilegales</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">4.3 Propiedad del Contenido</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Mantienes la propiedad de todo el contenido que publicas. Al publicar, nos otorgas una licencia
                    no exclusiva para usar, mostrar y distribuir tu contenido en la plataforma.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">5. Conducta del Usuario</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Te comprometes a:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Respetar a otros usuarios de la comunidad</li>
                <li>No acosar, intimidar ni amenazar a nadie</li>
                <li>No publicar información falsa o engañosa</li>
                <li>No intentar acceder a cuentas de otros usuarios</li>
                <li>No usar la plataforma para fines ilegales</li>
                <li>Reportar contenido que viole estos términos</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">6. Privacidad y Datos Personales</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Tu privacidad es importante para nosotros. El tratamiento de tus datos personales se rige
                por nuestra Política de Privacidad, en cumplimiento con la Ley N° 19.765 de Protección de Datos
                Personales de Uruguay.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Revisa nuestra Política de Privacidad para más información sobre cómo recopilamos, usamos
                y protegemos tus datos personales.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">7. Propiedad Intelectual</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Polo respeta los derechos de propiedad intelectual. Si crees que tu trabajo ha sido copiado
                de manera que constituya una infracción de derechos de autor, contáctanos en tefydron@gmail.com.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Los usuarios son responsables de asegurar que tienen los derechos necesarios para publicar
                cualquier contenido en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">8. Disponibilidad del Servicio</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Nos esforzamos por mantener el servicio disponible y funcionando correctamente. Sin embargo,
                no garantizamos que el servicio esté siempre disponible, libre de interrupciones o libre de errores.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nos reservamos el derecho de suspender o discontinuar el servicio en cualquier momento,
                con o sin aviso previo.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">9. Modificación del Servicio</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del
                servicio en cualquier momento, con o sin aviso previo.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">10. Terminación</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Podemos suspender o terminar tu cuenta si:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Violas estos términos de uso</li>
                <li>Violas nuestra política de privacidad</li>
                <li>Publicas contenido prohibido</li>
                <li>Participas en actividades fraudulentas o ilegales</li>
                <li>Usas la plataforma para acosar a otros usuarios</li>
              </ul>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                También puedes cerrar tu cuenta en cualquier momento a través de tu perfil.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">11. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                En la máxima medida permitida por la ley, Polo no será responsable por:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Daños indirectos, incidentales o consecuentes</li>
                <li>Pérdida de datos o información</li>
                <li>Interrupciones del servicio</li>
                <li>Contenido publicado por usuarios</li>
                <li>Enlaces a sitios web de terceros</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">12. Indemnización</h2>
              <p className="text-muted-foreground leading-relaxed">
                Aceptas indemnizar y mantener indemne a Polo, sus directores, empleados y agentes de
                cualquier reclamo, demanda o daño derivado de tu uso del servicio o violación de estos términos.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">13. Ley Aplicable y Jurisdicción</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier disputa
                relacionada con estos términos será resuelta en los tribunales competentes de Montevideo, Uruguay.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">14. Modificaciones</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones
                entrarán en vigor cuando se publiquen en esta página. Tu uso continuado del servicio después
                de las modificaciones constituye aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">15. Contacto</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Para cualquier pregunta sobre estos términos, contáctanos en:
              </p>
              <ul className="list-none text-muted-foreground space-y-1">
                <li>Email: tefydron@gmail.com</li>
                <li>Teléfono: +598 92 840 850</li>
                <li>Instagram: @tefymoya</li>
              </ul>
            </section>

            <section className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Última actualización: {new Date().toLocaleDateString('es-UY')}
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
