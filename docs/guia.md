# Guía de deckkit

Para quien nunca ha programado. No necesitas entender nada de esto para usarlo —
está aquí por si quieres saber qué está pasando.

---

## 1. Qué es esto

Tu deck deja de ser un archivo de PowerPoint y se vuelve una página web.

En una junta se comporta como siempre: flechas para avanzar, pantalla completa,
16:9 en el proyector. Fuera de la junta es un link que mandas por correo, se ve
bien en celular, y **siempre muestra la versión de hoy** — no la que mandaste
hace tres semanas.

Lo que lo hace distinto: tu marca vive en un solo lugar. Cambias un color ahí y
cambia en todas las slides. Y si escribes algo que se sale de tu marca — un
color que no es tuyo, un número sin fuente, texto que no cabe en pantalla — no
te deja publicarlo.

## 2. Qué necesitas antes de empezar

**Claude Code.** Es el asistente que hace todo el trabajo. Se instala desde
[claude.com/claude-code](https://claude.com/claude-code). Es una app donde le
escribes en español lo que quieres y lo hace.

Nada más. Si falta algo en tu computadora, el asistente lo instala.

**Ten a la mano, si los tienes:**

| | |
|---|---|
| Tu logo en **SVG** | el archivo que te dio tu diseñador, el que no se pixelea |
| Tus **colores** | los códigos tipo `#BFFF00`. Si no los sabes, sirve una imagen de tu marca |
| Tu **tipografía** | el nombre basta: "Poppins", "Inter" |
| Un **deck viejo en PDF** | lo convierte en borradores de slides |

Si no tienes alguno, se puede seguir sin él. El asistente te avisa qué puso de
relleno para que lo cambies después.

## 3. Cómo empezar

Abre Claude Code y pega esto:

```
Clona https://github.com/Santiagoac/deckkit en una carpeta nueva llamada
"mis-decks", entra a ella y haz start
```

Eso es todo. De ahí en adelante solo contestas preguntas.

## 4. Qué te va a preguntar

Son cinco bloques. Puedes parar donde sea y seguir después — se acuerda dónde
te quedaste.

**Tu empresa.** Qué vendes en una línea, a quién, qué quieres que recuerden, y
qué **no** eres. Esto último importa más de lo que parece: es lo que evita que
el deck suene a todos los demás.

**Tu marca.** Colores, tipografía, logo. De aquí sale un manual de marca tuyo,
no solo configuración.

**Tus materiales.** Tu sitio web, decks viejos, imágenes. Opcional.

**Tu gente y tus pruebas.** Equipo, clientes, números. Aquí te va a preguntar
dos cosas incómodas a propósito: *¿esta persona aceptó salir en un deck
público?* y *¿tienes permiso de mostrar el logo de este cliente?* Si la
respuesta es no, no entra. Muchos contratos lo prohíben.

**Tu voz.** Cómo hablas: palabras que nunca quieres ver, qué decir en su lugar,
si hablas de tú o de usted.

**Y al final:** si quieres una contraseña para la lista de tus decks. Ver el
punto 7.

## 5. Cómo ver tu deck

Cuando termines, el asistente te da un link que abre en tu navegador. Ese link
solo funciona en tu computadora — todavía no está en internet.

| Tecla | Qué hace |
|---|---|
| `→` o barra espaciadora | siguiente slide |
| `←` | anterior |
| `P` | modo presentación, 16:9 para proyector |
| `O` | ver todas las slides de un jalón |
| `Esc` | salir |

En celular: toca la franja de arriba para la barra, desliza para avanzar.

## 6. Cómo publicarlo

Cuando quieras mandarlo, dile al asistente **"ayúdame a publicarlo"**.

Te va a pedir crear una cuenta en Netlify (gratis, más rápido con Google) y de
ahí él hace el resto. Al final te entrega el link para mandar.

## 7. Dos cosas sobre quién puede ver qué

**Cada deck tiene un link imposible de adivinar.** Tu deck de ventas no vive en
`tusitio.com/ventas` sino en `tusitio.com/ventas-7f3a9c2b1d4e`. ¿Por qué?
Porque si fuera lo primero, el cliente al que le mandas el de ventas podría
probar `/inversionistas` y entrar. Con el sufijo aleatorio, no.

**La lista de todos tus decks lleva contraseña.** Esa página sí tiene todos los
links juntos, así que es la única que hay que cerrar. Tu equipo entra con la
contraseña; a tus clientes les mandas el link del deck y nunca ven la lista.

Ojo con el límite: quien tenga un link lo tiene para siempre y puede
reenviarlo. Esto evita que un cliente husmee tus otros decks. **No** vuelve
secreto un deck. Lo que de verdad no puede salir de tu empresa, no lo publiques.

## 8. Glosario

| | |
|---|---|
| **Claude Code** | el asistente. Le escribes en español y hace el trabajo |
| **GitHub** | donde se guarda y versiona código. **No lo necesitas** para usar esto |
| **Netlify** | donde vive tu deck en internet para que tenga un link. Gratis para esto |
| **repo** | la carpeta de tu proyecto, con su historial de cambios |
| **deploy** | publicar: subir la versión de hoy a internet |
| **slug** | el pedacito final del link de un deck, con su código aleatorio |
| **canon** | donde viven tu marca y tus datos. La única fuente de verdad |

## 9. Si algo no jala

[Abre un issue](https://github.com/Santiagoac/deckkit/issues/new?template=feedback.md)
y di en qué paso te atoraste. Sirve más de lo que crees: casi todo lo que está
en esta guía existe porque alguien se atoró ahí.
