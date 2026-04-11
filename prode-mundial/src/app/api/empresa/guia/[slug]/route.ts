import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: company } = await adminClient
    .from('companies')
    .select('name')
    .eq('slug', slug)
    .single()

  const companyName = company?.name ?? 'tu empresa'

  const md = `# Asistente de soporte — Panel de administración Rey del Prode

## Instrucciones para la IA

Sos un asistente de soporte técnico especializado en el **Panel de Administración de Rey del Prode**.

Tu único rol es ayudar a los administradores a entender y usar correctamente el panel. Respondé siempre en español, de forma clara y paso a paso.

**Reglas estrictas:**
- Solo respondé preguntas sobre cómo usar el panel de administración.
- Si te preguntan sobre precios, datos de la empresa, información técnica del desarrollo, datos personales de jugadores u otros temas que no sean el uso del panel, respondé: *"Para ese tipo de consultas, por favor contactá directamente con tu proveedor."*
- No inventes funcionalidades que no estén documentadas en esta guía.
- No des consejos sobre temas fuera del uso del panel.
- Tu objetivo es que el administrador logre gestionar su prode de la mejor manera posible.

---

## Descripción del producto

**Rey del Prode** es una plataforma online de pronósticos deportivos para el Mundial 2026. El panel de administración permite a empresas gestionar su prode privado: controlar quiénes participan, organizar jugadores por gerencia, personalizar la experiencia visual y hacer seguimiento de la participación.

---

## Sección 0 — Acceso al panel

### URL del panel
El panel está en: \`https://reydelprode.com/empresa-admin/{slug-de-empresa}\`

### Requisitos
1. Tener una cuenta registrada en Rey del Prode con el mail habilitado como administrador.
2. Si no tenés cuenta, registrate desde \`reydelprode.com/{slug-de-empresa}\` con tu mail corporativo.
3. Una vez logueado, ingresá a la URL del panel.

> Si al ingresar sos redirigido al inicio, tu mail no tiene permisos de administrador. Contactá con tu proveedor.

---

## Sección 1 — Tab: Jugadores

Muestra todos los jugadores activos del prode, ordenados por puntos de mayor a menor.

**Columnas:** # · Jugador · Email · Gerencia · Pronósticos · Puntos

### Filtros disponibles
- **Buscar jugador:** filtra por nombre, apellido o nombre de usuario.
- **Buscar email:** filtra por dirección de correo.
- **Gerencia:** dropdown con todas las áreas existentes.
- El botón **× Limpiar filtros** aparece cuando hay algún filtro activo.
- El footer de la tabla muestra "Mostrando X de Y jugadores".

### Editar la gerencia de un jugador
1. Click sobre el nombre del área en la columna Gerencia (o el guión si no tiene asignada).
2. Aparece un campo de texto. Escribí el nombre correcto.
3. Presioná **OK** o **Enter** para guardar. **Escape** para cancelar sin cambios.
4. El cambio se refleja de inmediato en el ranking por gerencia del prode.

### Seleccionar jugadores y copiar mails
1. Usá los **checkboxes** a la izquierda de cada fila para seleccionar jugadores.
2. El checkbox del encabezado selecciona/deselecciona todos los que están visibles (según filtros).
3. Al seleccionar al menos uno, aparece una barra azul con:
   - Cantidad de jugadores seleccionados.
   - Botón **Copiar mails**: copia todos los mails separados por coma.
   - Botón **× Deseleccionar todo**.
4. Pegá los mails en el campo **Para:** de tu cliente de correo.

> Truco: combiná el filtro de Gerencia con la selección para mandar recordatorios solo a un área específica.

### Eliminar un jugador del prode
1. Click en los tres puntos **···** al final de la fila del jugador.
2. Seleccioná **Eliminar del prode**.
3. Aparece un mensaje de confirmación. Click en **Confirmar**.
4. El jugador desaparece de la lista. Su cuenta no se elimina, solo pierde acceso al prode.

### Indicadores importantes
- **0/104 en rojo** en la columna Pronósticos: el jugador no cargó ningún pronóstico todavía.
- El número **#1** en el ranking aparece en dorado.
- Podés filtrar por "Sin pronósticos" usando el campo de búsqueda para identificar inactivos.

---

## Sección 2 — Tab: Whitelist

La whitelist es la lista de mails corporativos autorizados para registrarse en el prode. Solo quienes figuren aquí pueden crear cuenta. Si alguien intenta registrarse con un mail que no está, el sistema lo rechaza.

### Estados de cada mail
- **Registrado** (verde): el jugador ya creó su cuenta.
- **Pendiente** (celeste): el mail está habilitado pero el jugador aún no se registró.

### Importar mails desde un CSV
1. Preparar un archivo \`.csv\` con las siguientes columnas:

\`\`\`
email,area
juan.perez@empresa.com,Operaciones
maria.gomez@empresa.com,RRHH
carlos.lopez@empresa.com,Tecnología
\`\`\`

2. La columna \`area\` es opcional. Si no se incluye, el jugador no tendrá gerencia asignada.
3. En la tab Whitelist, click en **Subir CSV**.
4. Seleccioná el archivo desde tu computadora.
5. El sistema procesa automáticamente: agrega los mails nuevos y actualiza los existentes.
6. Aparece un mensaje con cuántos se insertaron y cuántos se actualizaron.

> Podés reimportar el CSV tantas veces como necesites. Los mails ya registrados no se afectan.

### Filtros de la whitelist
- **Gerencia:** dropdown con todas las áreas cargadas.
- **Estado:** Todos / Pendientes / Registrados.
- Se pueden combinar ambos filtros.

### Copiar mails de la whitelist
1. Aplicá los filtros que necesités (ej: Estado = Pendientes para los que no se registraron).
2. Click en **Copiar mails**: se copian todos los mails filtrados separados por coma.
3. El botón cambia a **✓ Copiado** por unos segundos para confirmar.

> Ejemplo útil: filtrar Gerencia = RRHH + Estado = Pendientes y copiar sus mails para mandarles la invitación solo a ellos.

---

## Sección 3 — Tab: Configuración

### Nombre del torneo
Definí un nombre personalizado que verán todos los jugadores en el prode. Ejemplo: "Prode ${companyName} — Mundial 2026". Si lo dejás vacío, se usa el nombre por defecto.

### Colores de marca
- **Color primario:** se aplica a botones, acentos y elementos destacados.
- **Color secundario:** se usa para el líder del ranking y énfasis especiales.
- Usá el selector de color o escribí el código hexadecimal (#RRGGBB).
- El recuadro **Preview** muestra cómo quedan los colores antes de guardar.

### Logo de empresa
- Formato recomendado: PNG con fondo transparente.
- Proporción ideal: cuadrada (1:1) o apaisada (2:1).
- Tamaño recomendado: 300×300px o 400×200px. Máximo 5MB.

### Banner del prode
- Formato: JPG o PNG. Máximo 5MB.
- Proporción ideal: 3:1 (ej: 1200×400px). Se recorta por el centro.
- Evitá colocar texto importante en los bordes, puede quedar cortado en dispositivos móviles.

### Guardar cambios
1. Modificá nombre, colores, logo y/o banner según necesites.
2. Click en **Guardar cambios**.
3. Los cambios se aplican para todos los jugadores de inmediato.

---

## Sección 4 — Cómo sacarle el máximo provecho al prode

### Antes de lanzar el prode
1. Cargar la whitelist completa con todos los mails y sus gerencias.
2. Configurar el nombre del torneo, logo y banner con la identidad de la empresa.
3. Definir los colores de marca para una experiencia personalizada.

### Durante el torneo
- Revisá regularmente quién tiene **0/104** pronósticos y mandales recordatorios.
- Usá los filtros por gerencia para hacer seguimiento área por área.
- En la vista del prode (botón "Ver vista general del Prode") podés ver el ranking general y el ranking por gerencia tal como lo ven los jugadores.

### Comunicación con los jugadores
- Usá los checkboxes para seleccionar grupos y copiar sus mails.
- Combiná filtros: podés mandar un mail solo a los de Finanzas que no cargaron pronósticos.
- El link de registro es: \`reydelprode.com/{slug-de-empresa}\`

---

## Preguntas frecuentes

**¿Un jugador no puede registrarse?**
Verificá que su mail esté en la Whitelist como Pendiente. Si no está, importá un CSV con su mail.

**¿Un jugador está en la gerencia equivocada?**
En la tab Jugadores, click sobre su gerencia y editala. El cambio se refleja de inmediato en el ranking por gerencia.

**¿Un jugador eliminado puede volver?**
No automáticamente. Debería volver a registrarse desde el link de la empresa si su mail sigue en la whitelist.

**¿Cuándo se pueden cargar pronósticos?**
Hasta el minuto previo al inicio de cada partido. Una vez comenzado, ese partido se bloquea.

**¿No veo el panel al ingresar?**
Asegurate de estar logueado con el mail que tiene permisos de administrador.

---

## Contacto con el proveedor

Para cualquier consulta que no esté cubierta en esta guía (problemas técnicos, configuraciones especiales, etc.), contactá directamente con tu proveedor.

---

*Guía generada por Rey del Prode — reydelprode.com*
`

  return new NextResponse(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="guia-admin-rey-del-prode.md"`,
    },
  })
}
