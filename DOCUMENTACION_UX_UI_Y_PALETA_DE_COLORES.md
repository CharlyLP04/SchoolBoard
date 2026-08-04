# 🎨 Documentación Técnica de Arquitectura Visual, UX/UI, Tipografía, Diseño Responsivo y Paleta de Colores

Este documento oficial detalla la justificación técnica, psicológica, ergonómica y arquitectónica de las decisiones de diseño implementadas en la plataforma **SchoolBoard**. Sirve como guía maestra para respaldar ante equipos, docentes o evaluadores la calidad del sistema de diseño, la adaptabilidad multidispositivo (responsividad), la tipografía seleccionada y las mejoras introducidas para garantizar una usabilidad de nivel profesional.

---

## 1. 🌈 Justificación de la Paleta de Colores & Psicología del Color

El sistema de diseño de **SchoolBoard** fue creado bajo el paradigma **"Dynamic Premium Aesthetics & Ergonomic Tech UI"**, alejándose deliberadamente de las interfaces planas, clínicas o anticuadas del software educativo tradicional, para ofrecer una experiencia visual impactante, inmersiva y de alto rendimiento.

### A. Superficies y Modo Oscuro por Defecto (Obsidian & Deep Slate)
* **`#0b0b10` (Fondo Principal Oscuro):** Se evita estrictamente el uso del negro puro absoluto (`#000000`), ya que ocasiona deslumbramiento al contrastar abruptamente con el texto blanco y provoca el defecto técnico de "mancha de arrastre" (*smearing*) en pantallas con tecnología OLED/AMOLED. En su lugar, se adoptó un tono **azul-obsidiana profundo**, que reduce la fatiga visual e induce un estado de alta concentración mental inmersiva (*Deep Work*) durante sesiones extensas de estudio o programación.
* **`#16161d` & `#1e1e28` (Superficies de Tarjetas, Campos y Modales):** La jerarquía arquitectónica de capas se logra elevando progresivamente la luminosidad. Las tarjetas y ventanas flotantes son ligeramente más claras que el fondo raíz y cuentan con bordes semitransparentes de cristal (*Glassmorphism*, `border-white/10` y `backdrop-blur-xl`) para separar planos sin necesitar cajas opacos abrumadoras.

### B. Modo Claro Ergonómico (Frost Blue & Crisp Alabaster)
* **`#f0f2f8` (Fondo Modo Claro - Frost Blue):** Sustituye al blanco deslumbrante (`#ffffff`) que daña la vista tras pocos minutos en salones muy iluminados. Es un fondo azul grisáceo pastel sumamente relajante.
* **`#ffffff` (Tarjetas de Trabajo):** Al estar en blanco puro sobre el fondo *Frost Blue* junto con una sombra suave (`box-shadow`), las tarjetas del tablero adquieren una elevación natural clara y elegante con contraste óptimo.

### C. Sistema Multi-Tema y Colores de Énfasis (Personalidad Dinámica)
La aplicación cuenta con un motor temático reactivo con **4 variantes armónicas** seleccionables por el usuario en tiempo real desde sus ajustes (con persistencia en memoria local):
1. **🟣 Lavanda Vibrante (`#8b7cf6` - Predeterminado):** Transmite sofisticación tecnológica, creatividad, orden y enfoque. Es el estándar de oro en herramientas modernas de software colaborativo y metodologías ágiles.
2. **🟢 Esmeralda Tech (`#10b981`):** Asociado psicológicamente al éxito, avance continuo de flujos de trabajo, productividad e innovación en ingeniería de software.
3. **🔴 Rubí / Rosa Coral (`#f43f5e`):** Aporta alta energía, pasión y dinamismo, excelente para equipos rápidos o sprints de alta intensidad.
4. **🟡 Ámbar Cálido (`#f59e0b`):** Homenajea directamente a las tradicionales notas adhesivas físicas (*sticky notes*) del método Kanban original, brindando calidez, optimismo y agility cultural.

### D. Paleta Semántica y Funcional de Prioridades
* **🔴 Prioridad Alta (`#f0655f` - Soft Crimson):** Rojo calibrado con opacidad moderada para alertar de urgencias e importancia crítica **sin generar sensación de alarma o error fatal en el sistema**.
* **🟠 Prioridad Media (`#f2a93b` - Warm Amber):** Naranjoso cálido que comunica un ritmo constante y atención equilibrada en fechas límite intermedias.
* **🟢 Prioridad Baja / Tarea Completada (`#4fbf6b` - Mint Green):** Verde menta que transmite paz, control de tareas y la satisfacción del cumplimiento en checklist.

---

## 2. 🖋️ Arquitectura Tipográfica y Legibilidad

La elección tipográfica de **SchoolBoard** está optimizada específicamente para interfaces de alta densidad de información (tableros con múltiples columnas, fechas, identificadores de épicas, avatares y gráficas estadísticos).

### A. Familias Tipográficas Seleccionadas (Google Fonts Geometric Sans-Serif)
* **`Plus Jakarta Sans` y `Outfit` (Tipografías Primarias):** Son fuentes de estilo *geometric sans-serif* modernas. 
  * **¿Por qué se eligieron?** A diferencia de las fuentes de sistema comunes (como Arial o Times New Roman), *Plus Jakarta Sans* y *Outfit* cuentan con una **altura de X (*x-height*) excepcionalmente alta**, formas redondas abiertas y separaciones numéricas precisas. Esto resulta vital al revisar números de progreso (ej. `67%`), códigos de tareas o fechas de entrega en pantallas de alta resolución.
* **`Inter` y `System-UI` (Resguardo Universal de Alto Rendimiento):** Aseguran que la interfaz se renderice de manera idéntica y ultra-veloz tanto en Windows, iOS, macOS, Linux y Android.

### B. Jerarquía y Pesos Tipográficos (*Weight & Tracking Rules*)
* **Titulares y Nombres de Sección (`font-black` / `font-extrabold` - Pesos 800 y 900):** Se utilizan con espaciado de letra condensado (`tracking-tight`) y degradados de color en encabezados para dar autoridad, dinamismo y clara separación del contenido operativo.
* **Cuerpo de Lectura y Descripción (`font-medium` - Peso 500):** Con un interlineado generoso (`line-height: 1.6`), facilitando la lectura fluida de párrafos extensos de instrucciones en cada pendiente.
* **Etiquetas y Micro-copias en Formularios (`uppercase text-xs font-black tracking-wider`):** Las etiquetas de inputs y selectores (ej. *"FECHA LÍMITA"*, *"RESPONSABLE"*) se formatean en mayúsculas pequeñas con un espaciado amplio (*letter-spacing*), lo cual aporta orden milimétrico y facilita el escaneo visual rápido.

### C. 🛡️ Sistema de Protección Ocular (Ergonomía de Lectura WCAG)
* Se implementó a nivel de variables globales de CSS (`index.css`) un sistema de prevención de sobreesfuerzo ocular. 
* **Escalado Mínimo Forzado:** Ningún elemento de texto, por diminuta que sea su anotación (como el peso en MB de un archivo o una fecha secundaria), puede descender por debajo de los **`0.75rem` (12px de tamaño visual)** con un interlineado mínimo de `1.4`. Esta regla garantiza el estricto cumplimiento de los estándares de accesibilidad **WCAG 2.1 (Nivel AA y AAA)**.

---

## 3. 📱 Diseño Responsivo, Flexibilidad Multidispositivo y Adaptabilidad

Para que **SchoolBoard** sea verdaderamente funcional en el entorno escolar y laboral moderno, fue desarrollado con una arquitectura de interfaz **Mobile-First** y **Fluid Grid Design**, asegurando una experiencia perfecta tanto en monitores 4K como en laptops escolares, tablets y teléfonos celulares.

### A. Grids Fluídos y Breakpoints Flexibles (Tailwind Grid & Flexbox)
El sistema utiliza puntos de ruptura (*breakpoints*) estándar (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`) para reordenar el lienzo dinámicamente según la pantalla:
* **En Monitores y Laptops de Escritorio (`xl` y `lg`):** El Tablero principal presenta **4 columnas en paralelo** (Pendiente, En Proceso, En Revisión, Completada) para visibilidad horizontal completa, y el directorio de equipos se organiza en redes de tarjetas 3x3.
* **En Tablets (`md` - iPad/Android):** El diseño bascula automáticamente a vistas de 2 columnas con barras divisoras reubicadas.
* **En Smartphones / Celulares (`sm` y resoluciones menores):** 
  * Las columnas del Tablero y las secciones de formularios (como Título, Responsable y Fecha) transicionan orgánicamente de una cuadrícula horizontal a un **flujo vertical en columna única (`grid-cols-1`)**. El usuario puede desplazarse verticalmente y cambiar entre columnas sin sufrir cortes horizontales ni deformación de cajas.

### B. Navegación Inteligente (Desktop vs. Mobile Menu)
* **Barra Superior Flotante (*Sticky Glassmorphic Header*):** Se mantiene fija en la parte superior del navegador con un efecto de desenfoque (`backdrop-blur-xl`), lo que permite que el usuario siempre tenga a mano el botón de creación de tareas sin tener que desplazarse hacia arriba tras revisar un listado largo.
* **Menú Colapsible Móvil (Icono Hamburguesa):** En pantallas chicas, los enlaces de texto de la navegación superior se ocultan y abren paso al botón de menú hamburguesa (`Menu` y `X` de Lucide). Al presionarse, despliega un panel lateral animado y accesible con los iconos bien estructurados para uso con una sola mano.

### C. Ergonomía Táctil y Zona de Confort del Pulgar (*Touch Hit Areas*)
* En dispositivos táctiles, tocar un botón con el dedo requiere un área superior a la del puntero del ratón. 
* **Áreas de Contacto Extendidas:** Todos los botones interactivos, casillas del checklist de subtareas, inputs de formulario y selectores tienen un relleno generoso (mínimo `py-2.5 px-3.5` a `py-3.5 px-6`, equivalente a **44x44 píxeles táctiles**). Esto evita la frustración del usuario al intentar presionar botones pequeños en pantallas táctiles y facilita el arrastre (*Drag & Drop*) de tarjetas en teléfonos.

### D. Control de Desbordamiento y Modales Adaptativos (*Responsive Modals*)
* **Cajones Flotantes (*Drawers* como `EditTaskDrawer.jsx`):** En escritorio ocupan solo un tercio de la pantalla (máximo `580px - 620px`) en el lateral derecho para que puedas seguir viendo el tablero tras ellos. En teléfonos móviles o pantallas reducidas, el cajón detecta el ancho del dispositivo y **pasa a cubrir el 100% de la pantalla (`w-full`)** convirtiéndose en una ventana de pantalla completa fácil de manejar con el dedo, con barras de desplazamiento internas customizadas (`custom-scrollbar` ultra-delgada de 6px).

---

## 4. 🚀 Principios de Experiencia de Usuario (UX) Implementados

### A. Reducción de la Carga Cognitiva y Modulación
* Los formularios pesados e interminables se dividieron en cajas conceptuales separadas con fondos semitransparentes (Información Principal, Clasificación, Evidencias, Subtareas). El ojo humano procesa cada grupo de manera rápida y relajada.
* **Ergonomía de Interacción en el Selector de Prioridades:** Se sustituyó el tradicional y molesto menú desplegable (`<select>`) de prioridad por **3 botones táctiles visibles de acción directa (Alta / Media / Baja)** con iconografía instantánea.

### B. Gamificación y Retroalimentación en Vivo (*Micro-Animations & Progress*)
* **Barra de Progreso Animada en Subtareas:** Al marcar casillas del checklist, una barra de progreso se va rellenando en vivo y calculando porcentajes (ej. `2/3 completados - 67%`). Esto activa un mecanismo psicológico de recompensa (*reward feedback*) que incentiva y motiva a terminar las tareas del proyecto escolar.
* **Micro-interacciones Táctiles:** El sistema reacciona con sutiles elevaciones y sombras al pasar el puntero (`hover:-translate-y-0.5`, `hover:shadow-xl`) y contracciones mecánicas al hacer clic (`active:scale-95`).

### C. Sistema Doble de Notificaciones y Retroalimentación Reactiva (*Reactive Feedback Architecture*)
* **Toasts Flotantes con Barra de Temporizador (Progress Countdown):** Las notificaciones de confirmación (*Toasts* de Éxito, Error o Información) están equipadas con una **barra de progreso temporizada en el pie de la tarjeta** que decrece animadamente hasta el 0% durante su duración (ej. 4 segundos). Cuentan con iconografía vibrante, resplandor difuso de fondo (*ambient glow*) y jerarquía con títulos en mayúsculas pequeñas ("OPERACIÓN EXITOSA", "ATENCIÓN REQUERIDA").
* **Centro de Notificaciones En Vivo (Notification Bell & Dropdown):** Ubicado estratégicamente en la barra superior junto al perfil del usuario. Cuenta con una campana interactiva con animación de pulso y vibración al detectar alertas no leídas, un indicador luminoso de cantidad (`animate-ping`) y un panel flotante con efecto de cristal de alta densidad (`backdrop-blur-2xl`). Permite filtrar por tipo (Épica, Checklist, Sistema, Reporte) y marcar todas como leídas en un solo clic.

### D. Prevención de Errores y Seguridad Visual
* **Dependencias Inteligentes:** En la vinculación de proyectos, el selector de *Historia de Usuario* se desactiva y opaca (`disabled:opacity-40`) hasta que el usuario elija primero una *Épica* coherente.
* **Modales Antiacaballamiento:** Toda acción destructiva (como *Restablecer Base de Datos* o eliminar compañeros de proyecto) invoca un diálogo de advertencia de seguridad para prevenir pérdidas accidentales de trabajo escolar.

---

## 5. 📋 Matriz de Resumen e Inspección Arquitectónica

| Módulo Evaluado | Especificación / Tecnología | Justificación UX / UI |
| :--- | :--- | :--- |
| **Paleta Oscura / Clara** | `#0b0b10` (Obsidian) / `#f0f2f8` (Frost Blue) | Elimina destellos clínicos y previene el efecto *smearing* OLED, protegiendo la vista. |
| **Tematización Dinámica** | 4 Paletas (Lavanda, Esmeralda, Rosa, Ámbar) | Adapta la personalidad visual y mejora el confort psicológico según la preferencia del usuario. |
| **Familias Tipográficas** | *Plus Jakarta Sans, Outfit, Inter* (Google Fonts) | Altura de X elevada para máxima legibilidad de números de métricas, porcentajes y fechas. |
| **Accesibilidad Textual** | Protección Ocular (Escalado CSS mínimo 12px) | Cumplimiento WCAG 2.1; erradica textos diminutos y previene cefaleas en sesiones largas. |
| **Diseño Responsivo** | Flexbox, Grid 1 a 4 columnas & Breakpoints (`sm` a `xl`) | Vista impecable e igual de potente en laptops 4K, iPads, Tablets y Celulares móviles. |
| **Ergonomía Táctil** | Hit Areas ampliados (≥ 44px) y Menú Hamburguesa | Fácil manipulación con los dedos en touchscreens, sin errores por botones excesivamente juntos. |
| **Notificaciones en Vivo** | Toasts temporizados & Centro de Campana (Navbar) | Feedback visual instantáneo con barras de progreso de tiempo y panel flotante de alertas. |
