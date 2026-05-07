# PROMPT PARA CLAUDE CODE — Rediseño de Landing Page Rey del Prode

## Contexto del proyecto

Estoy trabajando en `reydelprode.com`, una app web de prode para el Mundial 2026.

**Stack actual:** Next.js (App Router) + Supabase + Vercel.
**Identidad visual:** azul oscuro (navy `#0a1628`), dorado (`#f5c518`), tipografía
con presencia tipo Bebas Neue para títulos. Logo: escudo dorado con corona.
**Idioma:** español argentino (uso de "vos", "armá", "cargá").

Antes de arrancar leé los archivos del proyecto para entender el estado actual.
No asumas nada — verificá la estructura del repo.

## El problema que estoy resolviendo

La home actual (`/` o `/es`) muestra directamente la UI de la app autenticada
(sidebar con "Mis pronósticos", "Fases del Mundial", etc.) y un hero simple con
countdown.

**No funciona como landing de ventas.** Voy a invertir en Google Ads y necesito
una landing que convierta — con propuesta de valor clara, sección B2B y precios
visibles.

## Objetivo

Reemplazar la home pública por una **landing page de conversión** orientada a
dos audiencias:

1. **B2C** — usuarios individuales / grupos de amigos / familia
2. **B2B** — empresas que quieren hacer un prode interno entre empleados

La home actual de la app (la que muestra el sidebar con secciones) **debe quedar
accesible solo para usuarios logueados**, en una ruta tipo `/app` o `/dashboard`.
La nueva landing va en `/`.

## Mockup de referencia

Pegé el mockup HTML completo en `docs/landing-mockup.html`. **Leelo antes de
arrancar** — tiene la estructura, paleta exacta, animaciones GSAP y todas las
secciones con sus textos finales en español.

Usalo como guía visual y de estructura, **pero adaptalo al stack del proyecto**.
No copies el HTML crudo — convertilo a componentes Next.js bien estructurados.

## Modelo de negocio

Pago único por torneo (no suscripción). Tres tiers:

- **Free** — pronósticos públicos, sin prode privado, con publicidad
- **Pro** — precio único por Mundial (a definir, dejar como variable de
  configuración o placeholder `--`), prodes privados ilimitados hasta 50
  participantes
- **Empresa** — cotización a medida, formulario de contacto

## Secciones requeridas (en orden)

1. **Top ticker dorado** — marquee horizontal con datos del torneo
2. **Nav fija** — logo, links a secciones, botones "Iniciar sesión" + "Crear prode"
3. **Hero** — split layout: copy a la izquierda con headline tipográfico
   ("REY *del* PRODE"), eyebrow con live dot, CTAs (B2C y B2B), trust badges.
   A la derecha "trophy card" con anillos concéntricos y mini cards flotantes.
   Countdown live a 11 Jun 2026 16:00 (hora México) en barra inferior.
4. **Marquee de selecciones** — banderas y nombres de países en scroll horizontal
5. **Stats grid** (4 columnas) — 48 / 104 / 3 / 39 con contador animado al
   entrar en viewport
6. **Features** (6 cards en grid 6×1, cada card span-2) — con numeración
   "01 / FUNCIÓN", icono, título, descripción y arrow al hover
7. **Cómo funciona** (4 pasos numerados) — con línea conectora dorada y tiempo
   estimado de cada paso
8. **Casos de uso** (3 cards) — Familia, Clubes/Peñas, Empresas
9. **Sección Empresas** — split layout: lista numerada de 5 perks a la izquierda,
   formulario de contacto a la derecha (empresa, nombre, email, cantidad de
   participantes)
10. **Precios** (3 cards) — Free / Pro / Empresa, el del medio destacado con
    border dorado, badge "Más popular" y elevación
11. **FAQ** — split layout: título y CTA a la izquierda, acordeón con 6
    preguntas a la derecha (la primera abierta por defecto)
12. **CTA final** — countdown grande + headline con "EL MUNDIAL arranca EN" +
    dos CTAs
13. **Footer** — 4 columnas, redes sociales, links secundarios y copyright

## Tipografías

Usar `next/font` para cargarlas:

- **Bebas Neue** — display / títulos / números
- **Instrument Serif (italic)** — acentos elegantes en títulos ("del",
  "necesitás", "arranca", "frecuentes")
- **Inter** — body text / UI

## Detalles visuales clave (no perder)

- Mezcla tipográfica con cursiva dorada en acentos (esto es lo que más diferencia)
- Headline con texto outline dorado (efecto `-webkit-text-stroke`) en "PRODE"
- Live dot animado con efecto ping en el eyebrow del hero
- Stadium lights difuminados en el fondo del hero (tres conos radiales)
- Pelotas flotantes sutiles con animación
- Noise overlay sutil en todo el body (textura, evita el plano de IA)
- Trophy card con anillos concéntricos (uno dashed) detrás
- Mini cards flotantes alrededor del trofeo con animación independiente
- Border gradients en cards premium (la card de empresas y la card Pro)
- Countdowns con `font-variant-numeric: tabular-nums` para que no salten
- Selection con color dorado/navy
- Botones primary con shimmer al hover (luz que pasa de izq a der)
- Botones primary con magnetic hover (se mueven sutil con el mouse)
- Feature cards con barra dorada que se traza arriba al hover
- FAQ con icono que rota 45° al abrir
- Marquee de banderas con mask gradients en los bordes (fade out)

## Requisitos técnicos

- **Framework:** Next.js App Router. Crear la landing en `app/page.tsx` (o
  donde corresponda).
- **Animaciones:** usar **Framer Motion** (preferido en Next.js, mejor DX que
  GSAP en React). Usar GSAP solo si ya está instalado y querés mantener
  consistencia. Que las animaciones sean en scroll trigger + entrada del hero.
  Las animaciones del mockup están en GSAP — tradúcelas a Framer Motion.
- **Estilos:** respetar el sistema de estilos que ya use el proyecto
  (Tailwind, CSS Modules, styled-components, lo que sea). **No introducir un
  sistema nuevo.**
- **Componentes:** dividir en componentes por sección en `components/landing/`:
  - `Ticker.tsx`
  - `Navbar.tsx`
  - `Hero.tsx`
  - `CountriesMarquee.tsx`
  - `Stats.tsx`
  - `Features.tsx`
  - `HowItWorks.tsx`
  - `UseCases.tsx`
  - `Empresas.tsx`
  - `EmpresasContactForm.tsx`
  - `Pricing.tsx`
  - `FAQ.tsx`
  - `CtaFinal.tsx`
  - `Footer.tsx`
  - `Countdown.tsx` (compartido)
- **Responsive:** mobile-first. El mockup está pensado para desktop. Adaptar a
  mobile: nav con hamburguesa, grids en 1 columna, countdown más compacto, hero
  visual oculto en pantallas chicas.
- **SEO:** metadata correcta (title, description, OG image, twitter card) — clave
  para Google Ads. Schema.org JSON-LD para SoftwareApplication.
- **Performance:** imágenes con `next/image`, fonts con `next/font`, lazy load
  de secciones below the fold (Intersection Observer o `next/dynamic`).
- **Formulario empresas:** armarlo como server action o API route que mande el
  lead a Supabase. Proponé el schema de la tabla `enterprise_leads` (al menos:
  id, company_name, contact_name, email, participants_range, created_at, status).
- **Countdown:** client component (`"use client"`), useEffect con intervalo de 1s.
  Target: `2026-06-11T16:00:00-06:00`.
- **Dark mode:** la paleta es navy/dorado fija — no hace falta toggle, pero
  asegurate que el contraste cumpla AA.
- **Accessibility:** labels en formularios, aria-labels en botones de iconos,
  navegación por teclado, focus visible.

## Lo que NO hay que tocar

- La app autenticada (Mis pronósticos, Fases del Mundial, etc.). Solo migrarla
  a `/app` o `/dashboard` y proteger la ruta con el middleware de Supabase Auth.
- El sistema de auth, las queries a Supabase, las funciones de pronósticos.
- Los componentes existentes que se reutilicen (botones, inputs, etc.) — usalos
  si ya hay un sistema de design.

## Plan sugerido de ejecución

1. **Auditá la estructura actual del repo.** Decime qué hay en `app/`, qué
   componentes globales existen, qué sistema de estilos está en uso, si Framer
   Motion o GSAP ya están instalados, y si hay tokens/variables de diseño en
   algún archivo.

2. **Proponeme la migración:** dónde mover la app actual (`/app` vs `/dashboard`),
   cómo queda el routing, qué cambia en el middleware de auth.

3. **Creá la rama** `feat/landing-page` y trabajá ahí. Push con `-u` para
   upstream tracking. **No abras PR todavía** — primero terminamos.

4. **Implementá sección por sección**, commiteando con mensajes claros (un
   commit por sección o por componente lógico).

5. **Para la sección de empresas:** proponé el schema de la tabla en Supabase
   y el server action para guardar el lead. Antes de implementar, pasame el
   schema para revisarlo.

6. Cuando esté completa, levantá dev server y mostrame screenshots de cada
   sección para review antes de squash + PR.

## Antes de arrancar contestame

1. ¿Qué sistema de estilos tiene el repo hoy? (Tailwind, CSS Modules, Sass...)
2. ¿Framer Motion o GSAP ya están instalados?
3. ¿Hay algún componente de UI compartido que deba reutilizar (botones, cards,
   inputs)?
4. ¿La paleta exacta de colores está en algún archivo de tokens / variables?
5. ¿La app autenticada actualmente vive en `/` o tiene rutas separadas?
6. ¿Hay middleware de auth ya configurado con Supabase?

Una vez que tenga esas respuestas, arrancamos con el plan.
