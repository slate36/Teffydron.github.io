import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = { title: 'Política de Privacidad | Polo' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Política de Privacidad" subtitle="Protección de tus datos personales" />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
          <article className="space-y-8">
            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">1. Responsable del Tratamiento</h2>
              <p className="text-muted-foreground leading-relaxed">
                Polo (en adelante, "nosotros" o "el Servicio") es el responsable del tratamiento de los datos personales
                recogidos a través de esta plataforma, en cumplimiento con la Ley N° 19.765 de Protección de Datos Personales
                de la República Oriental del Uruguay.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">2. Datos que Recopilamos</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">2.1 Datos de Registro</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Nombre completo</li>
                    <li>Correo electrónico</li>
                    <li>Contraseña (almacenada de forma encriptada)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2.2 Datos de Perfil (opcionales)</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Nombre de usuario (handle)</li>
                    <li>Biografía</li>
                    <li>Ubicación</li>
                    <li>Sitio web</li>
                    <li>Usuario de Instagram</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2.3 Datos de Actividad</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Publicaciones que creas</li>
                    <li>Comentarios que realizas</li>
                    <li>Likes que das</li>
                    <li>Dirección IP (para seguridad)</li>
                    <li>User Agent del navegador</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">3. Finalidad del Tratamiento</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Tus datos personales son tratados con las siguientes finalidades:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Crear y mantener tu cuenta de usuario</li>
                <li>Permitirte participar en la comunidad</li>
                <li>Publicar, comentar y dar me gusta en contenido</li>
                <li>Garantizar la seguridad de la plataforma</li>
                <li>Mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">4. Base Legal del Tratamiento</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                El tratamiento de tus datos personales se basa en:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Consentimiento:</strong> Al registrarte, consientes el tratamiento de tus datos</li>
                <li><strong>Contrato:</strong> Para cumplir con el acuerdo de servicio</li>
                <li><strong>Interés legítimo:</strong> Para mantener la seguridad de la plataforma</li>
                <li><strong>Obligación legal:</strong> Para cumplir con la Ley 19.765</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">5. Derechos del Titular</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                De acuerdo con la Ley 19.765, tienes los siguientes derechos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Derecho de acceso:</strong> Solicitar información sobre tus datos</li>
                <li><strong>Derecho de rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Derecho de supresión:</strong> Solicitar la eliminación de tus datos ("derecho al olvido")</li>
                <li><strong>Derecho de oposición:</strong> Oponerte al tratamiento de tus datos</li>
                <li><strong>Derecho a la portabilidad:</strong> Solicitar tus datos en un formato estructurado</li>
                <li><strong>Derecho de revocación:</strong> Retirar tu consentimiento en cualquier momento</li>
              </ul>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Para ejercer estos derechos, contáctanos en tefydron@gmail.com
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">6. Seguridad de los Datos</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Encriptación de contraseñas</li>
                <li>Conexiones HTTPS seguras</li>
                <li>Control de acceso a la base de datos</li>
                <li>Monitoreo de actividades sospechosas</li>
                <li>Actualizaciones regulares de seguridad</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">7. Datos Sensibles</h2>
              <p className="text-muted-foreground leading-relaxed">
                De acuerdo con la Ley 19.765, no recopilamos datos sensibles (origen racial o étnico, opiniones políticas,
                convicciones religiosas, estado de salud, vida sexual, etc.) sin tu consentimiento explícito.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">8. Transferencia Internacional de Datos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tus datos pueden ser transferidos a países que garantizan un nivel de protección adecuado,
                en cumplimiento con la normativa uruguaya vigente.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">9. Conservación de los Datos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tus datos personales se conservarán mientras mantengas tu cuenta activa. Cuando solicites la
                eliminación de tu cuenta, procederemos a suprimir tus datos salvo que debamos conservarlos por
                obligaciones legales o para resolver disputas.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">10. Cambios a esta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nos reservamos el derecho de modificar esta política de privacidad. Te notificaremos de
                cualquier cambio significativo a través de la plataforma o por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-xl font-bold mb-4 text-primary">11. Contacto</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Para cualquier consulta relacionada con el tratamiento de tus datos personales, puedes
                contactarnos en:
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
