# Prode Mundial 2026 ⚽🏆

> **"El torneo familiar más importante del planeta."**

Bienvenido a **Prode Mundial 2026**, una Progressive Web App (PWA) de nivel premium y mobile-first diseñada para administrar el prode familiar del Mundial 2026. Combina la estética elegante de la App de la Copa Mundial de la FIFA y Apple Sports, con la fluidez estadística de Sofascore y FotMob.

---

## 🚀 Características Principales

1. **Dashboard Cinematográfico:** Countdown en vivo al inicio del Mundial, leaderboard animado en tiempo real con medallas, y carrusel de partidos clave.
2. **Draft de Selecciones Exclusivo:** Cada participante elige 2 países. El sistema detecta bloqueos en tiempo real para impedir que se repitan selecciones ("No se pueden repetir países").
3. **Leaderboard Inteligente con Animación:** Transiciones dinámicas fluidas con Framer Motion cuando cambian los puestos en la tabla de posiciones.
4. **Cálculo de Puntos Automatizado:** Lógica de puntos no acumulativa por fase (Octavos: 1, Cuartos: 2, Semis: 3, Final: 5, Campeón: 8), tomando la instancia máxima alcanzada.
5. **Criterios de Desempate Incorporados:** Desempata automáticamente priorizando al dueño del Campeón del Mundo, seguido de cantidad de finalistas.
6. **Panel de Control de Admin:** Permite simular y cargar resultados en vivo, cambiar estados de partidos (`upcoming`, `live`, `finished`) y avanzar países de fase de manera instantánea.
7. **PWA Lista para Instalar:** Offline caching por service workers, manifest configurado con iconos vectoriales de alta definición, instalable en Android e iOS.
8. **Doble Modo Inteligente (Supabase + Local Fallback):**
   - **Modo Supabase:** Se conecta a Supabase Auth y Database en tiempo real al detectar las variables de entorno.
   - **Modo Demo (Default Local):** Funciona al 100% de manera local en `localStorage` si no hay credenciales, permitiendo probar toda la app al instante.

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15 (App Router, React 19)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 (Glassmorphism, gradientes deportivos y glows premium)
- **Animaciones:** Framer Motion
- **Estado Global:** Zustand
- **Efectos:** Canvas Confetti

---

## 📦 Instalación y Ejecución Local

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```

2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador. 
   - *Tip:* Utiliza la vista de desarrollo móvil de Chrome/Safari para disfrutar de la experiencia móvil optimizada.

---

## 🗄️ Configuración de la Base de Datos (Supabase)

Para conectar tu base de datos de Supabase en producción:

1. Crea un proyecto nuevo en [Supabase](https://supabase.com/).
2. Ve al editor SQL de Supabase y pega el contenido completo del archivo [`schema.sql`](./schema.sql). Ejecútalo para crear las tablas, relaciones, políticas RLS, funciones y los seeds del Mundial.
3. Copia tus credenciales en un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
4. Reinicia el servidor. La app detectará automáticamente las credenciales, desactivará el Modo Demo y se conectará en tiempo real.

---

## 🏆 Reglamento Oficial del Torneo

### Participantes
- **Total:** 5
- Cada participante elige **2 selecciones** antes de que arranque el Mundial.
- **No se pueden repetir países** entre participantes.

### Sistema de Puntajes
Cada selección suma puntos según la instancia máxima alcanzada:
- **Octavos de final:** 1 punto
- **Cuartos de final:** 2 puntos
- **Semifinal:** 3 puntos
- **Finalista:** 5 puntos
- **Campeón del Mundo:** 8 puntos

*Nota: Los puntos NO son acumulativos por fase.*

### Ganador
Se suman los puntos de las dos selecciones de cada participante. El que tenga más puntos gana el torneo.

### El Castigo 💀
El que termine en la última posición de la tabla será oficialmente **"La de Leila de las tetas caídas"** durante 24 horas y deberá actuar como esclavo de los otros cuatro participantes durante todo un día.

### En caso de empate:
1. Gana quien tenga al campeón del mundo.
2. Si sigue el empate, gana quien tenga más finalistas.
3. Si sigue igual, se define por penales, moneda o batalla campal familiar.
