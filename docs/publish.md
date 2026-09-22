# Publicar tu deck

El camino corto es decirle al asistente **"ayúdame a publicarlo"** y contestar
lo que pregunte. Esto es lo mismo, escrito, por si quieres hacerlo tú o entender
qué está pasando.

Solo hay un hosting soportado: **Netlify**. No es pereza — la contraseña de la
lista de decks es una *edge function* de Netlify, así que un segundo hosting
sería una segunda implementación de lo mismo.

---

## Sin GitHub (el camino normal)

No necesitas cuenta de GitHub. Se publica desde tu carpeta.

**1. Crea una cuenta** en [netlify.com](https://netlify.com). Con Google es lo
más rápido.

**2. Conecta la terminal con tu cuenta.** Se abre el navegador para que
apruebes:

```bash
npx netlify-cli login
```

**3. Publica.**

```bash
npx netlify-cli deploy --prod
```

La primera vez pregunta si crear un sitio nuevo. Di que sí. Te va a dar una
dirección tipo `https://algo-random-123.netlify.app`.

`netlify.toml` viaja con el deploy, así que la protección de la lista y los
encabezados se van solos. No hay que configurarlos en la web.

**4. Decide quién ve la lista de decks.** Una de las dos:

```bash
# Con contraseña (lo normal si vas a tener decks internos)
npx netlify-cli env:set DECK_INDEX_PASSWORD "tu-contraseña"

# O abierta a propósito
npx netlify-cli env:set DECK_INDEX_PUBLIC true
```

**5. Publica otra vez.** Sí, otra vez:

```bash
npx netlify-cli deploy --prod
```

Esto no es un paso de más. Netlify congela las variables en cada publicación,
así que una contraseña puesta después de la última publicación **no hace nada**
hasta que vuelvas a publicar. Si te saltas este paso y crees que ya la
cambiaste, la anterior sigue funcionando.

**6. Abre tu link.** El del deck, con su código:
`https://tu-sitio.netlify.app/ventas-7f3a9c2b1d4e`.

Corre `npm run deck:urls` para ver la dirección de cada deck.

## Lo que vas a ver, y no es un error

**La raíz pide contraseña, el deck no.** Es el diseño: la lista de decks es
privada, cada deck es un link que mandas. Si le picas a "← Decks" desde un deck,
te topas con la contraseña. Está bien así.

**Sin ninguna de las dos variables, la raíz da error 503.** También es a
propósito. Una contraseña que falta nunca debe significar "que pase cualquiera";
tiene que ser una decisión que alguien escribió. El mensaje del 503 te dice qué
hacer.

## Tu propio dominio

En Netlify: Domain management → Add a domain. Te dice qué registro DNS crear
donde tengas tu dominio. El certificado HTTPS lo pone Netlify solo.

## Cambiar la contraseña después

Dos pasos, siempre:

```bash
npx netlify-cli env:set DECK_INDEX_PASSWORD "la-nueva"
npx netlify-cli deploy --prod
```

Sin el segundo, la anterior sigue abriendo. Medido: 45 segundos después de
cambiar el valor sin volver a publicar, la contraseña vieja seguía entrando y la
nueva no.

Cambiar la contraseña también cierra las sesiones de todos, porque la cookie va
firmada con ella. Es a propósito.

## Revocar un link que se filtró

```bash
npm run deck:slug -- --rotate ventas
npx netlify-cli deploy --prod
```

El link viejo da 404. El nuevo lo ves con `npm run deck:urls`.

## Con GitHub (avanzado)

Si prefieres que se publique solo cada vez que cambias algo: sube el repo a
GitHub (**privado** — el onboarding guarda información de tu empresa y fotos de
tu equipo) y en Netlify conéctalo con "Import from Git". A partir de ahí cada
push publica.

La contraseña se pone igual, en Site configuration → Environment variables, y
también necesita una publicación después.
