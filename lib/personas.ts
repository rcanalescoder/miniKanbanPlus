import type { BorradorPersona, Persona, Tarea } from "@/tipos/tareas";
import {
  limpiarTextoPlano,
  limitesSeguridad,
  limitarColeccion,
  normalizarUrlImagen
} from "@/lib/seguridad";

export const almacenamientoPersonas = "miniKanbanPlus.personas";

type GamaColor = {
  fondoA: string;
  fondoB: string;
  texto: string;
};

const gamasColor: GamaColor[] = [
  { fondoA: "#0ea5e9", fondoB: "#38bdf8", texto: "#f8fafc" },
  { fondoA: "#f59e0b", fondoB: "#fcd34d", texto: "#1f2937" },
  { fondoA: "#10b981", fondoB: "#6ee7b7", texto: "#052e16" },
  { fondoA: "#ec4899", fondoB: "#f9a8d4", texto: "#4a044e" },
  { fondoA: "#6366f1", fondoB: "#a5b4fc", texto: "#eef2ff" }
];

export function generarIdentificadorPersona() {
  return `PR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function obtenerIniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const iniciales = partes.slice(0, 2).map((parte) => parte[0]?.toUpperCase() ?? "");
  return iniciales.join("") || "P";
}

export function crearFotoAvatar(nombre: string, indiceColor = 0) {
  const gama = gamasColor[indiceColor % gamasColor.length];
  const iniciales = obtenerIniciales(nombre);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="fondo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${gama.fondoA}" />
          <stop offset="100%" stop-color="${gama.fondoB}" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="42" fill="url(#fondo)" />
      <circle cx="120" cy="38" r="24" fill="rgba(255,255,255,0.22)" />
      <circle cx="32" cy="122" r="34" fill="rgba(255,255,255,0.15)" />
      <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle"
        font-family="Avenir Next, Trebuchet MS, sans-serif" font-size="54" font-weight="700"
        fill="${gama.texto}">
        ${iniciales}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function crearBorradorPersona(): BorradorPersona {
  return {
    nombre: "",
    area: "",
    foto: ""
  };
}

export function crearPersonaDesdeBorrador(
  borrador: BorradorPersona,
  indiceColor: number
): Persona {
  const nombre = limpiarTextoPlano(borrador.nombre, limitesSeguridad.nombreMaximo);

  return {
    identificador: generarIdentificadorPersona(),
    nombre,
    area: limpiarTextoPlano(borrador.area, limitesSeguridad.areaMaxima),
    foto: normalizarUrlImagen(borrador.foto) || crearFotoAvatar(nombre, indiceColor)
  };
}

export const personasEjemplo: Persona[] = [
  {
    identificador: "PR-1001",
    nombre: "Pepe",
    area: "Operaciones",
    foto: crearFotoAvatar("Pepe", 0)
  },
  {
    identificador: "PR-1002",
    nombre: "Juan",
    area: "Finanzas",
    foto: crearFotoAvatar("Juan", 1)
  },
  {
    identificador: "PR-1003",
    nombre: "Sara",
    area: "Personas",
    foto: crearFotoAvatar("Sara", 2)
  }
];

export function obtenerPersonaAleatoria(personas: Persona[]) {
  if (personas.length === 0) {
    return null;
  }

  const indice = Math.floor(Math.random() * personas.length);
  return personas[indice] ?? null;
}

export function obtenerIdentificadorPersonaAleatorio(personas: Persona[]) {
  return obtenerPersonaAleatoria(personas)?.identificador ?? "";
}

export function normalizarPersonas(personas: Persona[]) {
  return limitarColeccion(personas, limitesSeguridad.personasMaximas).map(
    (persona, indice) => {
      const nombre = limpiarTextoPlano(persona?.nombre, limitesSeguridad.nombreMaximo);
      const area = limpiarTextoPlano(persona?.area, limitesSeguridad.areaMaxima);

      return {
        identificador: limpiarTextoPlano(
          persona?.identificador,
          limitesSeguridad.nombreMaximo
        ) || generarIdentificadorPersona(),
        nombre: nombre || `Persona ${indice + 1}`,
        area: area || "Área no definida",
        foto:
          normalizarUrlImagen(persona?.foto) || crearFotoAvatar(nombre || "Persona", indice)
      };
    }
  );
}

export function sincronizarTareasConPersonas(tareas: Tarea[], personas: Persona[]) {
  const identificadores = new Set(personas.map((persona) => persona.identificador));

  return tareas.map((tarea) => {
    if (tarea.personaAsignadaId && identificadores.has(tarea.personaAsignadaId)) {
      return tarea;
    }

    return {
      ...tarea,
      personaAsignadaId: obtenerIdentificadorPersonaAleatorio(personas)
    };
  });
}
