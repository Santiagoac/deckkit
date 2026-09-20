# deckkit — Diseño

- **Fecha:** 2026-09-20
- **Autor:** Santiago Aceves con Claude
- **Estado:** aprobado en brainstorming, pendiente de plan de implementación
- **Naturaleza:** repo público MIT. Aporte personal de Santiago a otros founders, no producto de Moffin.
- **Destino:** `github.com/Santiagoac/deckkit` — público, MIT. Verificado vacío de
  contenido: solo LICENSE y README. Renombrado desde `sales-decks` el 2026-09-20.
- **No confundir con** `moffin-tech/sales-decks`, privado, que es el deck real de Moffin
  y no se toca. Ver la nota de nomenclatura al final de §2.

---

## 1. Objetivo

Empaquetar el motor de presentaciones que se construyó para Moffin como un **repo
template público** que otro founder pueda usar con su propia identidad, sin heredar
nada de Moffin.

El founder hace click en *Use this template*, abre Claude Code, y un skill de
onboarding lo entrevista hasta levantar el expediente completo de su empresa —
marca, activos, equipo, prueba social, voz — **antes** de que exista la primera
slide. De ahí en adelante escribe decks y el repo no lo deja romper su propio canon.

**Qué lo distingue de un prompt.** Un prompt describe; este repo obliga. Lo que hace
cumplir la calidad no es documentación, es el build: schema de Zod, tokens generados
y una suite de evals. El founder hereda la disciplina, no el canon de Moffin.

---

## 2. Decisiones cerradas

Tomadas por Santiago en el brainstorming del 2026-09-20.

| # | Decisión | Implicación |
|---|---|---|
| D1 | Repo **template con el skill adentro** | Cero instalación externa. Todo llega con el clon |
| D2 | **Inglés** | Hay que traducir campos, componentes y mensajes de error |
| D3 | **Sin deck de ejemplo** | El skill genera el primer deck; un ejemplo ficticio solo sería algo que borrar |
| D4 | Alcance **motor + identidad + reglas de calidad** | No se comparte la narrativa comercial de Moffin |
| D5 | **`canon/` es la única fuente de verdad**; los tokens CSS se generan | "Nunca escribas un color" pasa de regla a física |
| D6 | **Onboarding primero**, autoría después, con gate entre ambos | El onboarding es reanudable |
| D7 | **brand-book-generator se vendoriza** (skill propio de Santiago) | Con crédito en el README |
| D8 | Licencia **MIT** | Obliga la limpieza de §3. Ya está puesta en el repo destino |
| D9 | **Sin UI.** Todo ocurre en el flujo de skills de Claude Code | El repo no sirve una app de configuración; `CLAUDE.md` orquesta (§5.0) |
| D10 | El camino termina en **publicar**, no en "tienes un repo" | Se agrega el skill `deck-publish` (§8). No se vendoriza `land` de gstack: es de terceros |

### Nota de nomenclatura — resuelta

Había dos repos llamados `sales-decks` que significaban lo contrario: el privado de
Moffin **es** un conjunto de decks; el público **no**, es el motor para fabricarlos.
Un founder que clona "sales-decks" espera presentaciones y recibe maquinaria vacía.

El público se renombró a **`deckkit`** el 2026-09-20. GitHub mantiene la redirección
desde la URL vieja.

---

## 3. Qué NO puede publicarse

Auditoría del repo de Moffin, 2026-09-20. Esto es un requisito legal, no una preferencia.

| Activo | Por qué no |
|---|---|
| `public/fonts/*.woff2` (140 KB) | Graphik es de Commercial Type (orden OPBIJN), Aeonik Mono de CoType. Publicar los `woff2` es redistribución y viola ambas EULAs |
| `logos-clientes.png`, `logos-inversionistas.png`, `integraciones.png` | Marcas de terceros (Salesforce, SAP, Microsoft, Google, bancos) |
| `equipo-*.png` (8 fotos) | Dato personal de gente que no consintió aparecer en un repo público |
| `logo-*.{png,svg}`, `muffin.png`, `ascii-*.jpg`, `datos-fragiles.jpg` | Marca Moffin |
| `src/content/hechos.yaml` | 8 datos de operación internos |
| `src/content/slides/*.mdx` | Copy comercial de Moffin |

**Lo que sí se publica:** ~1,747 líneas de motor sin una sola referencia a Moffin.
La separación ya existe porque el repo se construyó con el contenido apartado del
render; publicar es quitar `content/` y `public/assets/`, no refactorizar.

El deck de Moffin se queda privado en `moffin-tech/sales-decks` y no se toca.

---

## 4. Arquitectura

```
deckkit/
├── .claude/skills/
│   ├── deck-onboarding/          # el punto de entrada (§5)
│   ├── deck-authoring/           # escribir y revisar slides (§7)
│   ├── deck-publish/             # preflight, exposición, host, verificar (§8)
│   └── brand-book-generator/     # vendorizado, crédito a Santiago (§6)
├── canon/                        # ÚNICA fuente de verdad, la leen las evals
│   ├── brand.yaml
│   ├── voice.yaml
│   ├── facts.yaml
│   └── onboarding.yaml           # estado del onboarding, para reanudar
├── company/                      # contexto para escribir, lo lee el agente
│   ├── positioning.md
│   ├── audiences.md
│   ├── objections.md
│   └── proof.md
├── reference/                    # decks viejos, PDFs fuente — EN .gitignore
├── public/assets/                # logos, fotos, ilustraciones
├── scripts/
│   ├── build-canon.mjs           # canon/brand.yaml -> tokens.generated.css
│   └── import-deck.mjs           # PDF/PPTX -> renders + copy
├── src/
│   ├── content/{slides,decks}/   # vacíos, con .gitkeep
│   ├── content.config.ts         # schemas Zod
│   ├── components/{slides,mdx}/
│   ├── deck/runtime.ts
│   ├── styles/
│   └── pages/
├── evals/{brand,voice,facts}.test.ts
├── .github/workflows/ci.yml      # build + evals; deploya solo si licensed: false
├── netlify.toml · vercel.json    # plantillas de deploy con headers (§8.1)
└── CLAUDE.md · README.md · LICENSE
```

### 4.1 `canon/` y la generación de tokens

`src/styles/tokens.generated.css` se produce desde `canon/brand.yaml` en cada `dev`
y `build` (hooks `predev`/`prebuild`), y está en `.gitignore`. No existe un archivo
de colores que editar a mano.

```yaml
# canon/brand.yaml
name: Acme
palette:
  primary: { 50: '#E5F8FE', 500: '#52B5EB', 950: '#143054' }   # escalas completas
  neutral: { ... }
backgrounds:
  cream: { bg: neutral.50,  fg: auto, logo: dark }
  navy:  { bg: primary.950, fg: auto, logo: light }
accents:
  blue: { strong: primary.950, soft: primary.700 }
typography:
  display: { family: Inter, source: google, weights: [400, 500, 700] }
  body:    { family: Inter, source: google, weights: [400, 500] }
  mono:    { family: 'JetBrains Mono', source: google, weights: [400] }
  licensed: false
logo:
  on_light: assets/logo-dark.svg
  on_dark:  assets/logo-light.svg
spacing_base: 8
```

**`fg: auto`** — `build-canon.mjs` calcula el texto contra cada fondo y **falla el
build si el contraste no llega a AA**. Usa el mismo cálculo WCAG de
`brand-book-generator/scripts/color_tools.py`.

**`licensed: true`** — las fuentes quedan en `.gitignore`, el README explica cómo
cargarlas localmente, y `build-canon.mjs` escribe la cadena CSS con el fallback de
`font-fallbacks.md` al final: `'Graphik', 'Inter', sans-serif`. Quien clone sin las
fuentes ve el fallback; el dueño ve su marca. Esta regla existe porque Moffin se
topó exactamente con ese caso.

### 4.2 Vocabulario en inglés

| Español (repo Moffin) | Inglés (deckkit) | Nota |
|---|---|---|
| `plantilla` | `template` | **Nunca `layout`**: está reservado por Astro en frontmatter de MDX y lo resuelve como ruta de import |
| `fondo` / `acento` | `background` / `accent` | |
| `titulo` / `cierre` / `pie` / `notas` | `title` / `closing` / `footer` / `notes` | |
| `vozDelCliente` | `customerVoice` | |
| `hechos` | `facts` | campos: `value`, `label`, `source`, `reviewedOn`, `validForDays`, `usage` |
| `recorridos` | `decks` | cada archivo es un deck para una audiencia; cada uno es una ruta |
| `Lista` `Numerada` `Bullet` `Dato` `Metrica` `Cita` | `List` `Numbered` `Bullet` `Fact` `Metric` `Quote` | |
| `portada` `declaracion` `numerada-split` `pilar` `metricas` `producto` `equipo` `galeria-logos` `cierre` | `cover` `statement` `numbered-split` `pillar` `metrics` `product` `team` `logo-wall` `closing` | |

---

## 5. El onboarding

### 5.0 El punto de entrada

Lo que el founder recibe de Santiago es una sola instrucción: *copia el repo, ábrelo
en Claude Code y dile que empiece.* Todo lo demás lo tiene que llevar el repo.

**`CLAUDE.md` es el orquestador.** Es el archivo que Claude lee por su cuenta, así que
ahí vive el camino ordenado, no en el README. Su primera sección dice, textualmente,
que antes de cualquier otra cosa hay que leer `canon/onboarding.yaml` y anunciarle al
founder en qué paso va y cuál sigue. Eso convierte un archivo estático en un saludo
que sabe dónde se quedaron.

El orden que declara:

```
0. Orientarte          leer canon/onboarding.yaml y decir dónde vamos
1. Empresa             qué vendes, a quién, en una frase          [obligatorio]
2. Marca               paleta, tipografía, logo -> manual de marca [obligatorio]
3. Recursos            sitio web, decks anteriores, imágenes       [opcional]
4. Gente y prueba      equipo, clientes, inversionistas, métricas  [opcional]
5. Voz                 léxico, disclaimers, tagline                [obligatorio]
6. Tu primer deck      elegir audiencia y escribir slides
7. Publicarlo          revisar exposición, elegir host, verificar en vivo
```

Nota de orden respecto a §5 más abajo: **marca sube al paso 2** porque es lo que
desbloquea todo lo visual y porque es el paso con mejor retorno psicológico — el
founder sale de ahí con un manual de marca en la mano y quiere seguir. Los pasos
de recursos y de gente quedan después, que es donde se cansa la gente y donde da lo
mismo pausar.

**Reanudable y visible desde afuera.** `npm run check` imprime el mismo estado que
Claude anuncia, para el founder que abre el repo sin Claude o que quiere saber qué
le falta sin gastar una conversación.

**Sin UI (D9).** No se construye pantalla de configuración. El flujo de preguntas de
los skills es la interfaz. Una UI significaría mantener un formulario que duplica lo
que el skill ya pregunta mejor, y el founder tendría dos lugares donde editar lo mismo.

### 5.1 Los pasos

Skill `deck-onboarding`. **Reanudable**: `canon/onboarding.yaml` lleva el estado de
cada paso (`pending` / `partial` / `done`) y el skill retoma donde se quedó. Nadie
contesta todo esto de una sentada.

| # | Paso | Qué produce | Cómo | |
|---|---|---|---|---|
| 1 | Empresa | `company/positioning.md`, `company/audiences.md` | Pregunta | obligatorio |
| 2 | Marca | `canon/brand.yaml` + manual de marca `.md` | Delega en brand-book-generator (§6) | obligatorio |
| 3 | Recursos | Ilustraciones recortadas, copy previo, paleta detectada | Lee el **sitio web**; importa **decks anteriores** con `scripts/import-deck.mjs` | opcional |
| 4 | Gente y prueba | `canon/team.yaml`, `canon/facts.yaml`, `company/proof.md`, logos | Archivos + preguntas de permiso | opcional |
| 5 | Voz | `canon/voice.yaml` | Pregunta | obligatorio |

**El paso 3 es el de mejor retorno y el que ya sabemos hacer.** Casi todo founder
tiene sitio y un PDF de inversionistas, y ambos ya codifican su marca sin que él tenga
que describirla. `import-deck.mjs` es la generalización del flujo que se usó con el PDF
de Moffin: `pdftoppm` para renders de referencia, recortes por región para extraer
ilustraciones, y volcado del copy a MDX. El founder llega con un PDF y sale con sus
ilustraciones recortadas y su contenido en el repo.

Va después de marca, y no antes, porque el paso 2 es el que desbloquea todo lo visual
y el que deja al founder con algo en la mano. El 3 y el 4 son los largos: es donde la
gente se cansa, y por eso son opcionales y pausables.

**Dos preguntas existen por hallazgos reales, no por prolijidad:**

- **Paso 2, licencia de fuentes.** Si están licenciadas, no se commitean.
- **Paso 4, consentimiento.** Las fotos de personas son dato personal. Los logos de
  clientes son marcas de terceros que muchas startups no tienen permiso de mostrar.
  Se pregunta antes de que el archivo entre al repo, no después.

**`reference/` va en `.gitignore` por default.** Un deck de inversionistas trae cosas
que nadie quiere en GitHub. Publicarlo debe ser decisión explícita del founder.

---

## 6. Integración de brand-book-generator

Se vendoriza en `.claude/skills/brand-book-generator/` con crédito a Santiago en el
README. Es skill propio (D7), así que no hay problema de licencia.

**Qué se usa tal cual:**

- `scripts/color_tools.py scale` — escala 50-950 determinista desde un solo hex, con
  `--anchor`. Resuelve el caso real: el founder tiene un color, no una paleta.
- `scripts/color_tools.py contrast` — WCAG. Es la implementación de `fg: auto`.
- `references/font-fallbacks.md` — ya mapea Graphik→Inter y Aeonik Mono→Space Mono.
- Sus batches 1-4 y 6 de entrevista, que se solapan con los pasos 1, 2 y 5.
- Su disciplina: nunca escribir una escala a mano, hex exactos, decir qué se sustituyó,
  nunca inventar datos de marca.

**Qué se adapta:**

1. **Salida adicional.** BBG produce `.md` + `.jsx`, que son documentación. deckkit
   necesita `canon/brand.yaml`, que el build **lee**. Se escribe un adaptador que emite
   el YAML desde los mismos tokens ya fijados. Misma fuente, tres salidas, sin deriva
   posible.
2. **El `.md` se conserva como entregable.** El founder sale del onboarding con un
   manual de marca además del deck.
3. **El `.jsx` sale de la ruta crítica.** Queda opcional.
4. **`check_consistency.py` no se usa como gate.** Compara dos documentos con grep;
   en deckkit el gate equivalente es que el build truene, que es más fuerte.
5. **La política de fuentes se invierte.** BBG sustituye la fuente licenciada en el
   entregable porque un artifact no puede cargarla. En deckkit el founder corre el repo
   en su máquina: usa la real, la gitignorea, y el fallback es para quien clone sin ella.

---

## 7. Reglas de calidad

La división importa: unas van en el motor y no se negocian, otras salen de `canon/`
y cada quien declara las suyas.

**Mecánicas — en el motor, no configurables:**

1. Una slide siempre cabe en la pantalla. Sin scroll interno; si sobra contenido, un
   factor de ajuste reduce la escala de esa slide.
2. El contenido se elige de listas cerradas. Inventar un `template`, `background` o
   `accent` rompe el build con un mensaje que dice cuáles son válidos.
3. Una slide se corrige en un solo lugar. Los decks la referencian, nunca la copian.
4. Todo número resuelve contra `canon/facts.yaml`.

**Política — desde `canon/`:**

5. Cero colores fuera de la paleta declarada.
6. Espaciado en múltiplos de `spacing_base`.
7. Contraste AA en cada par fondo/texto.
8. Cero léxico prohibido *suyo* (`canon/voice.yaml`), con sus propias excepciones.
9. Todo hecho con `source`, `reviewedOn` y `validForDays`. Un hecho caducado rompe el build.
10. Un hecho marcado `usage: [internal]` no puede aparecer en un deck externo.
11. Los disclaimers que su canon exige están presentes donde se disparan.

### 7.1 El gate entre onboarding y autoría

`npm run check` reporta completitud del onboarding. El skill `deck-authoring`
**se niega a escribir slides si los pasos 1 (empresa), 2 (marca) y 5 (voz) no están `done`** — sin
identidad ni voz declaradas, escribir slides es adivinar y luego rehacer.

Los pasos 3 (recursos) y 4 (gente y prueba) son opcionales: se puede armar un deck
sin decks previos ni fotos de equipo.

---

## 8. Publicar

Skill `deck-publish`. El founder no termina en "tengo un repo", termina en "tengo un
link que mandar". El repo trae `netlify.toml` y `vercel.json` listos.

**No se vendoriza `land` de gstack** (D10): es de terceros y deckkit se publica MIT.
Se escribe una versión propia y mínima, que además hace algo que un flujo de deploy
genérico no hace — la revisión de exposición del paso 2.

### 8.1 Las fases del skill

1. **Preflight.** `npm run build` y las evals. Si algo falla, se detiene y explica.
   Nunca se publica un deck que no pasa su propio canon.
2. **Revisión de exposición.** Lista exactamente qué se vuelve público: cuántas fotos
   de personas, qué logos de clientes, qué hechos con qué fuentes. Confirma contra los
   permisos que se registraron en el paso 4 del onboarding. Si algún activo entró sin
   consentimiento marcado, se detiene. Después pregunta: ¿link público o con contraseña?
3. **Host.** Netlify o Vercel. Crea el sitio, conecta el repo, configura el build.
4. **Headers.** `noindex, nofollow` en el HTML — un deck de ventas se comparte por link,
   no se busca en Google — y cache inmutable en `/assets` y `/fonts`.
5. **Verificación en producción.** Contra la URL en vivo, no contra local: código de
   respuesta, que el `noindex` realmente se haya aplicado, y que el deck renderice.
6. **Reporte.** La URL, y qué quedó expuesto.

Los pasos 4 y 5 salen de la experiencia real del deploy de Moffin: los headers son los
que se escribieron ahí, y verificar en producción atrapó un bug que en local no existía.

### 8.2 La trampa de las fuentes licenciadas

Consecuencia directa de §4.1 que hay que resolver aquí o muerde en silencio:

**Si `licensed: true`, las fuentes están en `.gitignore`. El build de CI no las tiene.**
Un deploy automático desde GitHub renderizaría con el fallback de Google y el founder
vería su deck correcto en su máquina y equivocado en el link que manda.

Por eso `deck-publish` ramifica según `canon/brand.yaml`:

| `licensed` | Cómo se publica | Qué hace CI |
|---|---|---|
| `false` (Google Fonts) | Deploy automático desde el repo en cada push | Build, evals y deploy |
| `true` | **Deploy desde el build local**, que sí tiene las fuentes reales | Build y evals solamente, como gate — no deploya |

En el caso licenciado el skill lo dice en voz alta: los deploys los dispara él desde su
máquina, y CI sigue cuidando que nada fuera de canon entre al repo.

---

## 9. Fases

**Fase 1 — El motor publicable.** Extraer las ~1,747 líneas, traducirlas al
vocabulario de §4.2, `canon/` con `build-canon.mjs`, los schemas Zod leyendo de
`canon/`, y el repo limpio sin activos de Moffin.
*Terminado cuando:* un `canon/brand.yaml` escrito a mano produce un deck de 3 slides
que corre, se presenta y pasa el build.

**Fase 2 — Las evals.** Las tres suites de §7, CI, y `npm run check`.

**Fase 3 — El onboarding.** El skill `deck-onboarding` con los 5 pasos,
`onboarding.yaml` reanudable, `import-deck.mjs`, y la vendorización de
brand-book-generator con su adaptador a `canon/brand.yaml`.

**Fase 4 — Autoría.** El skill `deck-authoring`, el gate de §7.1, el `CLAUDE.md`
orquestador de §5.0 y `npm run check`.

**Fase 5 — Publicación y salida al mundo.** El skill `deck-publish` con sus seis
fases y la ramificación de fuentes de §8.2, las plantillas `netlify.toml` y
`vercel.json`, el workflow de GitHub Actions, `README.md`, `LICENSE`, y el repo
marcado como template.

---

## 10. Fuera de alcance

- La narrativa comercial de Moffin (D4). El motor no opina sobre qué decir.
- Export a PDF.
- CMS o editor visual.
- Traducción del repo a más idiomas.
- Migrar el deck de Moffin a deckkit. Se queda donde está; deckkit nace del motor, no lo reemplaza.

---

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| El onboarding es tan largo que nadie lo termina | Reanudable por pasos; solo los pasos 1, 2 y 5 son obligatorios; BBG ya trae un "fast path" que arma un v1 con cuatro respuestas |
| Un founder publica fuentes licenciadas sin darse cuenta | La pregunta de licencia es obligatoria en el paso 2, y `licensed: true` mete las fuentes a `.gitignore` automáticamente |
| Un founder publica fotos o logos sin permiso | Preguntas de consentimiento en el paso 4, antes de que el archivo entre al repo |
| El motor traducido se desincroniza del de Moffin | deckkit es un fork consciente, no un paquete compartido. Se acepta la divergencia; nadie mantiene dos |
| Un founder publica con fuentes licenciadas y ve fallbacks sin notarlo | §8.2: `deck-publish` ramifica según `licensed` y deploya desde el build local cuando aplica |
| `import-deck.mjs` falla con PPTX | Fase 3 arranca solo con PDF, que es el caso probado. PPTX se agrega si alguien lo pide |
