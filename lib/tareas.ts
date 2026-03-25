import {
  type BorradorTarea,
  type DestinoArrastre,
  type EstadoKanban,
  type OrdenTablero,
  type Persona,
  type PrioridadTarea,
  type SentidoOrden,
  type Tarea,
  estadosKanban,
  prioridadesTarea,
  tiposTarea
} from "@/tipos/tareas";
import { obtenerIdentificadorPersonaAleatorio } from "@/lib/personas";
import {
  limpiarTextoMultilinea,
  limpiarTextoPlano,
  limitesSeguridad,
  limitarColeccion,
  normalizarEnteroSeguro,
  normalizarUrlNavegable
} from "@/lib/seguridad";

const jerarquiaPrioridad: Record<PrioridadTarea, number> = {
  BAJA: 0,
  MEDIA: 1,
  ALTA: 2,
  URGENTE: 3
};

export const almacenamientoTareas = "miniKanbanPlus.tareas.v2"; // Nueva versión para cambios de esquema

export function generarIdentificador() {
  return `TK-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function crearBorradorVacio(
  estado: EstadoKanban = "DEFINIDO",
  personas: Persona[] = [],
  semanaId: string = ""
): BorradorTarea {
  return {
    titulo: "",
    tipo: "Planificacion",
    prioridad: "MEDIA",
    complejidad: 1,
    fechaDeseableFin: "",
    observaciones: "",
    enlace: "",
    estado,
    personaAsignadaId: obtenerIdentificadorPersonaAleatorio(personas),
    semanaId: semanaId,
    proyectoId: undefined
  };
}

export function crearTareaDesdeBorrador(
  borrador: BorradorTarea,
  indiceOrden: number
): Tarea {
  const titulo = limpiarTextoPlano(borrador.titulo, limitesSeguridad.tituloMaximo);

  return {
    identificador: generarIdentificador(),
    fechaCreacion: new Date().toISOString(),
    indiceOrden,
    titulo,
    tipo: tiposTarea.includes(borrador.tipo) ? borrador.tipo : "Planificacion",
    prioridad: prioridadesTarea.includes(borrador.prioridad)
      ? borrador.prioridad
      : "MEDIA",
    complejidad: borrador.complejidad || 1,
    fechaDeseableFin: normalizarFechaDia(borrador.fechaDeseableFin),
    observaciones: limpiarTextoMultilinea(
      borrador.observaciones,
      limitesSeguridad.observacionesMaximas
    ),
    enlace: normalizarUrlNavegable(borrador.enlace),
    estado: estadosKanban.includes(borrador.estado) ? borrador.estado : "DEFINIDO",
    personaAsignadaId: limpiarTextoPlano(borrador.personaAsignadaId, 40),
    semanaId: borrador.semanaId,
    proyectoId: borrador.proyectoId
  };
}

export function normalizarTareasPersistidas(tareas: Tarea[]) {
  return limitarColeccion(tareas, limitesSeguridad.tareasMaximas).map((tarea) => ({
    identificador:
      limpiarTextoPlano(tarea?.identificador, 40) || generarIdentificador(),
    fechaCreacion: normalizarFechaIso(tarea?.fechaCreacion),
    titulo:
      limpiarTextoPlano(tarea?.titulo, limitesSeguridad.tituloMaximo) ||
      "Tarea sin título",
    tipo: tiposTarea.includes(tarea?.tipo) ? tarea.tipo : "Planificacion",
    prioridad: prioridadesTarea.includes(tarea?.prioridad)
      ? tarea.prioridad
      : "MEDIA",
    complejidad: tarea?.complejidad || 1,
    fechaDeseableFin: normalizarFechaDia(tarea?.fechaDeseableFin),
    observaciones: limpiarTextoMultilinea(
      tarea?.observaciones,
      limitesSeguridad.observacionesMaximas
    ),
    enlace: normalizarUrlNavegable(tarea?.enlace),
    estado: estadosKanban.includes(tarea?.estado) ? tarea.estado : "DEFINIDO",
    personaAsignadaId: limpiarTextoPlano(tarea?.personaAsignadaId, 40),
    indiceOrden: normalizarEnteroSeguro(tarea?.indiceOrden),
    semanaId: tarea?.semanaId || "",
    proyectoId: tarea?.proyectoId
  }));
}

export function obtenerSiguienteIndice(tareas: Tarea[], estado: EstadoKanban) {
  return tareas.filter((tarea) => tarea.estado === estado).length;
}

export function normalizarIndices(tareas: Tarea[]) {
  const contadores: Record<EstadoKanban, number> = {
    DEFINIDO: 0,
    EN_CURSO: 0,
    BLOQUEADO: 0,
    TERMINADO: 0
  };

  return tareas
    .map((tarea) => ({ ...tarea }))
    .sort((a, b) => {
      if (a.estado === b.estado) {
        return a.indiceOrden - b.indiceOrden;
      }

      return a.estado.localeCompare(b.estado);
    })
    .map((tarea) => {
      const indiceOrden = contadores[tarea.estado];
      contadores[tarea.estado] += 1;

      return { ...tarea, indiceOrden };
    });
}

export function moverTarea(
  tareas: Tarea[],
  identificador: string,
  destino: DestinoArrastre
) {
  const origen = tareas.find((tarea) => tarea.identificador === identificador);

  if (!origen) {
    return tareas;
  }

  const resto = tareas
    .filter((tarea) => tarea.identificador !== identificador)
    .map((tarea) => ({ ...tarea }));

  const grupoDestino = resto
    .filter((tarea) => tarea.estado === destino.estado)
    .sort((a, b) => a.indiceOrden - b.indiceOrden);

  const indiceAjustado =
    origen.estado === destino.estado && origen.indiceOrden < destino.indice
      ? destino.indice - 1
      : destino.indice;

  const indiceNormalizado = Math.max(
    0,
    Math.min(indiceAjustado, grupoDestino.length)
  );

  const tareaMovida: Tarea = {
    ...origen,
    estado: destino.estado
  };

  grupoDestino.splice(indiceNormalizado, 0, tareaMovida);

  const otrosEstados = resto.filter((tarea) => tarea.estado !== destino.estado);
  const recombinadas = [...otrosEstados, ...grupoDestino];

  return normalizarIndices(recombinadas);
}

export function ordenarTareas(
  tareas: Tarea[],
  criterio: OrdenTablero,
  sentido: SentidoOrden
) {
  const multiplicador = sentido === "asc" ? 1 : -1;
  const copia = [...tareas];

  return copia.sort((a, b) => {
    if (criterio === "manual") {
      if (a.estado === b.estado) {
        return (a.indiceOrden - b.indiceOrden) * multiplicador;
      }

      return 0;
    }

    const valor =
      criterio === "titulo"
        ? a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" })
        : criterio === "tipo"
          ? a.tipo.localeCompare(b.tipo, "es", { sensitivity: "base" })
          : criterio === "prioridad"
            ? jerarquiaPrioridad[a.prioridad] - jerarquiaPrioridad[b.prioridad]
            : criterio === "fechaDeseable"
              ? compararFechas(a.fechaDeseableFin, b.fechaDeseableFin)
              : compararFechas(a.fechaCreacion, b.fechaCreacion);

    if (valor !== 0) {
      return valor * multiplicador;
    }

    return a.indiceOrden - b.indiceOrden;
  });
}

function compararFechas(fechaA: string, fechaB: string) {
  if (!fechaA && !fechaB) {
    return 0;
  }

  if (!fechaA) {
    return 1;
  }

  if (!fechaB) {
    return -1;
  }

  return new Date(fechaA).getTime() - new Date(fechaB).getTime();
}

function normalizarFechaIso(valor: unknown) {
  if (typeof valor !== "string") {
    return new Date().toISOString();
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return new Date().toISOString();
  }

  return fecha.toISOString();
}

function normalizarFechaDia(valor: unknown) {
  if (typeof valor !== "string") {
    return "";
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(valor.trim()) ? valor.trim() : "";
}

export function agruparPorEstado(
  tareas: Tarea[],
  estado: EstadoKanban,
  criterio: OrdenTablero,
  sentido: SentidoOrden
) {
  const filtradas = tareas.filter((tarea) => tarea.estado === estado);

  return ordenarTareas(filtradas, criterio, sentido);
}

export function formatearFechaCorta(fechaIso: string) {
  if (!fechaIso) {
    return "";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short"
  }).format(new Date(fechaIso));
}

export function formatearFechaMedia(fechaIso: string) {
  if (!fechaIso) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(fechaIso));
}

import { obtenerSemanaId } from "@/lib/semanas";

const semanaActual = obtenerSemanaId();

export const tareasEjemplo: Tarea[] = normalizarIndices([
  {
    identificador: "TK-1001",
    fechaCreacion: "2026-03-10T09:00:00.000Z",
    titulo: "Preparar reunión de dirección",
    tipo: "Reunion",
    prioridad: "ALTA",
    complejidad: 3,
    fechaDeseableFin: "2026-03-24",
    observaciones: "Definir agenda, asistentes y mensajes clave para el comité.",
    enlace: "https://example.com/reunion-direccion",
    estado: "DEFINIDO",
    personaAsignadaId: "",
    indiceOrden: 0,
    semanaId: semanaActual
  },
  {
    identificador: "TK-1002",
    fechaCreacion: "2026-03-11T08:10:00.000Z",
    titulo: "Revisar indicadores mensuales",
    tipo: "Analisis",
    prioridad: "MEDIA",
    complejidad: 2,
    fechaDeseableFin: "2026-03-26",
    observaciones: "Comparar desviaciones y extraer alertas para operaciones.",
    enlace: "",
    estado: "DEFINIDO",
    personaAsignadaId: "",
    indiceOrden: 1,
    semanaId: semanaActual
  },
  {
    identificador: "TK-1003",
    fechaCreacion: "2026-03-12T07:25:00.000Z",
    titulo: "Coordinar propuesta presupuestaria",
    tipo: "Coordinacion",
    prioridad: "URGENTE",
    complejidad: 8,
    fechaDeseableFin: "2026-03-21",
    observaciones: "Consolidar cifras de finanzas, personas y tecnología.",
    enlace: "",
    estado: "EN_CURSO",
    personaAsignadaId: "",
    indiceOrden: 0,
    semanaId: semanaActual
  },
  {
    identificador: "TK-1004",
    fechaCreacion: "2026-03-12T10:45:00.000Z",
    titulo: "Actualizar cuadro de mando",
    tipo: "Seguimiento",
    prioridad: "ALTA",
    complejidad: 5,
    fechaDeseableFin: "2026-03-22",
    observaciones: "Refrescar métricas y validar los datos con negocio.",
    enlace: "https://example.com/cuadro-mando",
    estado: "EN_CURSO",
    personaAsignadaId: "",
    indiceOrden: 1,
    semanaId: semanaActual
  },
  {
    identificador: "TK-1005",
    fechaCreacion: "2026-03-13T12:00:00.000Z",
    titulo: "Validar cronograma de proyecto",
    tipo: "Planificacion",
    prioridad: "MEDIA",
    complejidad: 3,
    fechaDeseableFin: "2026-03-20",
    observaciones: "Falta confirmación del proveedor externo para cerrar hitos.",
    enlace: "",
    estado: "BLOQUEADO",
    personaAsignadaId: "",
    indiceOrden: 0,
    semanaId: semanaActual
  },
  {
    identificador: "TK-1006",
    fechaCreacion: "2026-03-08T15:20:00.000Z",
    titulo: "Cerrar informe ejecutivo",
    tipo: "Documentacion",
    prioridad: "ALTA",
    complejidad: 1,
    fechaDeseableFin: "2026-03-18",
    observaciones: "Versión final enviada y pendiente solo de archivo interno.",
    enlace: "",
    estado: "TERMINADO",
    personaAsignadaId: "",
    indiceOrden: 0,
    semanaId: semanaActual
  }
]);
export function obtenerTareas(): Tarea[] {
  if (typeof window === "undefined") return tareasEjemplo;
  const raw = window.localStorage.getItem(almacenamientoTareas);
  if (!raw) return tareasEjemplo;
  try {
    return JSON.parse(raw) as Tarea[];
  } catch {
    return tareasEjemplo;
  }
}

export function guardarTareas(tareas: Tarea[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(almacenamientoTareas, JSON.stringify(tareas));
  }
}
