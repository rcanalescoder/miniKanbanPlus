import { type Proyecto, type TareaPeriodica } from "@/tipos/tareas";

const CLAVE_PROYECTOS = "miniKanbanPlus.proyectos.v2";

export const proyectoAdministrativo: Proyecto = {
  identificador: "PRJ-ADMIN",
  nombre: "Labores Administrativas",
  descripcion: "Tareas de gestión interna, pagos y administración.",
  color: "#0ea5e9",
  tareasPeriodicas: [
    {
      identificador: "TP-001",
      titulo: "Generar pagos semanales",
      tipo: "Planificacion",
      prioridad: "ALTA",
      complejidad: 3,
      frecuencia: "Semanal",
      activo: true
    },
    {
      identificador: "TP-002",
      titulo: "Revisión de facturas",
      tipo: "Analisis",
      prioridad: "MEDIA",
      complejidad: 2,
      frecuencia: "Mensual",
      activo: true
    }
  ]
};

export function obtenerProyectos(): Proyecto[] {
  if (typeof window === "undefined") return [proyectoAdministrativo];
  const raw = window.localStorage.getItem(CLAVE_PROYECTOS);
  if (!raw) return [proyectoAdministrativo];
  try {
    return JSON.parse(raw) as Proyecto[];
  } catch {
    return [proyectoAdministrativo];
  }
}

export function guardarProyectos(proyectos: Proyecto[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLAVE_PROYECTOS, JSON.stringify(proyectos));
  }
}

export function guardarProyecto(proyecto: Proyecto) {
  const proyectos = obtenerProyectos();
  const indice = proyectos.findIndex(p => p.identificador === proyecto.identificador);
  if (indice >= 0) {
    proyectos[indice] = proyecto;
  } else {
    proyectos.push(proyecto);
  }
  guardarProyectos(proyectos);
}

export function eliminarProyecto(identificador: string) {
  const proyectos = obtenerProyectos().filter(p => p.identificador !== identificador);
  guardarProyectos(proyectos);
}

export function actualizarTareaPeriodica(proyectoId: string, tarea: TareaPeriodica) {
  const proyectos = obtenerProyectos();
  const proyecto = proyectos.find(p => p.identificador === proyectoId);
  if (!proyecto) return;
  
  const indice = proyecto.tareasPeriodicas.findIndex(t => t.identificador === tarea.identificador);
  if (indice >= 0) {
    proyecto.tareasPeriodicas[indice] = tarea;
  } else {
    proyecto.tareasPeriodicas.push(tarea);
  }
  guardarProyecto(proyecto);
}

export function eliminarTareaPeriodica(proyectoId: string, tareaId: string) {
  const proyectos = obtenerProyectos();
  const proyecto = proyectos.find(p => p.identificador === proyectoId);
  if (!proyecto) return;
  
  proyecto.tareasPeriodicas = proyecto.tareasPeriodicas.filter(t => t.identificador !== tareaId);
  guardarProyecto(proyecto);
}

export function crearProyectoVacio(): Proyecto {
  return {
    identificador: `PRJ-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    nombre: "",
    descripcion: "",
    color: "#0ea5e9",
    tareasPeriodicas: []
  };
}

export function crearTareaPeriodicaVacia(): TareaPeriodica {
  return {
    identificador: `TP-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    titulo: "",
    tipo: "Planificacion",
    prioridad: "MEDIA",
    complejidad: 1,
    frecuencia: "Semanal",
    activo: true
  };
}
