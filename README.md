# ✈️ TripFlow - Gestión de Gastos de Viaje

TripFlow es una aplicación web responsiva diseñada para gestionar presupuestos y gastos de viaje en tiempo real. Construida con Next.js y Supabase, permite a los usuarios planificar viajes, registrar tickets fotográficos de gastos, y mantener un control estricto de sus finanzas con validaciones inteligentes.

Este proyecto fue desarrollado como parte del reto técnico para **Alegra**.

---

## Características Principales
- **Dashboard Interactivo:** Visualización gráfica del presupuesto consumido.
- **Gestión de Viajes:** Creación de viajes con buscador de ciudades integrado (Nominatim OpenStreetMap) y presupuestos por divisa.
- **Control de Gastos:** Registro de gastos por categorías, con validaciones estrictas de fechas y alertas de sobregiro.
- **Adjuntar Recibos:** Soporte nativo para tomar fotos de tickets/facturas desde dispositivos móviles y subirlos a la nube.
- **Mobile First:** Interfaz diseñada desde cero (Bottom Navigation, Botones flotantes tipo Nequi) garantizando una experiencia similar a una app nativa.

---

## Tecnologías Utilizadas
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI.
- **Backend & BD:** Supabase (PostgreSQL), Supabase Storage.
- **Gestión de Estado:** React Hooks + Server Actions (Next.js).
- **Iconos & Estilos:** Lucide React, Framer Motion (Animaciones nativas de Tailwind).

---

## Guía de Instalación Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Requisitos Previos
Asegúrate de tener instalado en tu computadora:
- [Node.js](https://nodejs.org/es) (versión 18.17.0 o superior).
- Una cuenta gratuita en [Supabase](https://supabase.com/).

### 2. Clonar el repositorio e instalar dependencias
Abre tu terminal y ejecuta:
```bash
git clone https://github.com/tu-usuario/tripflow-alegra-reto.git
cd tripflow-alegra-reto
npm install
```

### 3. Configurar Supabase (Base de datos y Storage)
1. Crea un nuevo proyecto en Supabase.
2. Ve al editor SQL de Supabase y ejecuta el script de migración para crear las tablas (puedes encontrar la estructura en las anotaciones del repositorio).
3. Ve a **Storage** y crea un nuevo Bucket llamado `receipts`.
   - Asegúrate de marcar el bucket como **"Public"** para que las imágenes puedan visualizarse.

### 4. Configurar las Variables de Entorno
Crea un archivo llamado `.env.local` en la raíz del proyecto. Copia y pega las siguientes variables, reemplazando los valores con las credenciales de tu proyecto de Supabase (las encuentras en Project Settings > API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_jwt
```

### 5. Iniciar el Servidor de Desarrollo
Finalmente, corre el proyecto:
```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000). ¡La aplicación ya debería estar funcionando conectada a tu propia base de datos!

---

## Decisiones de Diseño (Notas para Alegra)
- **Carga de Imágenes:** Se decidió utilizar *Supabase Storage* por encima de pasar imágenes en Base64 por rendimiento y escalabilidad.
- **Arquitectura:** Se usaron fuertemente los **Server Actions** de Next.js para aislar la lógica de base de datos de los componentes del cliente, logrando un código más seguro y limpio.
- **UX/UI:** Se priorizó el uso de portales (`createPortal`) y el estado del foco para solucionar solapamientos en dispositivos móviles, un reto común al mezclar menús absolutos con listas.
