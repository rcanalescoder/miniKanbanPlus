import { type Persona, type Sesion, type Usuario } from "@/tipos/tareas";
import { obtenerPersonas } from "@/lib/personas";

const CLAVE_SESION = "miniKanbanPlus.sesion";

export const usuarioAdmin: Usuario = {
  identificador: "USR-ADMIN",
  nombre: "Administrador",
  area: "Sistemas",
  foto: "", // Se generará un avatar por defecto
  rol: "admin",
  clave: "admin",
  color: "#0ea5e9"
};

export function login(identificador: string, clave: string): Sesion | null {
  // 1. Intentar con el Admin por defecto (y sus posibles actualizaciones)
  if (identificador === "admin" && clave === "admin") {
     return crearSesion(usuarioAdmin);
  }

  // 2. Buscar en la lista de personas almacenadas
  const personas = obtenerPersonas();
  const usuario = personas.find(p => 
    (p.identificador.toLowerCase() === identificador.toLowerCase() || 
     p.nombre.toLowerCase() === identificador.toLowerCase()) && 
    (p.clave === clave)
  );

  if (usuario) {
    return crearSesion(usuario);
  }

  return null;
}

function crearSesion(persona: Persona): Sesion {
  const sesion: Sesion = {
    usuario: {
      identificador: persona.identificador,
      nombre: persona.nombre,
      area: persona.area,
      foto: persona.foto,
      rol: persona.rol,
      color: persona.color
    },
    token: `token-${Math.random().toString(36).slice(2)}`
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }
  
  return sesion;
}

export function obtenerSesion(): Sesion | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CLAVE_SESION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Sesion;
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CLAVE_SESION);
  }
}
