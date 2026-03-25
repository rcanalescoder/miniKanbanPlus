# 🏢 miniKanbanPlus

**Agilidad es la base para el Alto Rendimiento.**

`miniKanbanPlus` es un gestor de tareas visual, ligero y potente, diseñado para demostrar las capacidades del desarrollo orientado a prompts (Bytecoding). Está pensado para ayudar a equipos a organizar su trabajo semanal, priorizar compromisos y visualizar el rendimiento de manera inmediata.

![Agile Dashboard](/public/assets/qr_code.jpg)

## 🚀 Vision: Bytecoding
Este proyecto ha sido generado íntegramente mediante **Inteligencia Artificial**, utilizando un flujo de trabajo de "Bytecoding". La idea es que la estructura, la lógica y la estética profesional se deriven de un diálogo estratégico entre el humano (definición de negocio) y el agente IA (arquitectura y ejecución).

## ✨ Características Principales
- **Panel Kanban Semanal**: Visualización clara del flujo de trabajo por estados.
- **Gestión de Proyectos y Tareas Periódicas**: Automatización de tareas recurrentes.
- **Dashboard de Rendimiento**: Métricas visuales y comparativas de puntos de esfuerzo (Fibonacci).
- **Diseño Alegre y Accesible**: Interfaz de alto contraste, tipografía escalada para legibilidad y estética profesional "Glassmorphism" clara.
- **Seguridad Local**: Persistencia basada en `localStorage` para una experiencia fluida sin bases de datos complejas (ideal para demostraciones y uso personal).

## 🛠️ Instalación y Uso Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/miniKanbanPlus.git
   ```
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```
   Accede a `http://localhost:3000`

## 🌍 Despliegue en GitHub Pages
El proyecto está configurado para un **despliegue estático (Static Export)**.

1. **Generar la build**:
   ```bash
   npm run build
   ```
2. **Subir la carpeta `out`** a la rama `gh-pages` o configurar el GitHub Action de Next.js.
   > [!NOTE]
   > El archivo `next.config.ts` ya tiene habilitado `output: 'export'` para que funcione en servidores estáticos sin necesidad de Node.js en ejecución.

## 📝 Guía de Reproducción (Prompts)
En la raíz del proyecto encontrarás el archivo `prompt miniKanbanPlus.txt`. Este documento contiene las instrucciones originales y sugerencias para evolucionar esta herramienta hacia un entorno empresarial (Backend real, Auth robusta, DB persistente).

## ⚖️ Licencia
Este proyecto se distribuye bajo la **Licencia MIT**. 
*Nota: Se requiere mención o contribución explícita reconociendo a Roberto Canales Mora en cualquier derivación o uso del software.*

---
*Un proyecto de demostración para equipos de Alto Rendimiento.*
