"use client";

import { useMemo, useState, useEffect } from "react";
import { type Tarea, type Proyecto, type Persona } from "@/tipos/tareas";
import { obtenerTareas } from "@/lib/tareas";
import { obtenerProyectos } from "@/lib/proyectos";
import { obtenerPersonas } from "@/lib/personas";
import { obtenerSemanaActual, calcularRangoSemana } from "@/lib/semanas";

export function TabDashboard() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [semanaId, setSemanaId] = useState(obtenerSemanaActual().id);

  useEffect(() => {
    setTareas(obtenerTareas());
    setProyectos(obtenerProyectos());
    setPersonas(obtenerPersonas());
  }, []);

  const stats = useMemo(() => {
    const tareasSemana = tareas.filter(t => t.semanaId === semanaId);
    const total = tareasSemana.length;
    const completadas = tareasSemana.filter(t => t.estado === "TERMINADO").length;
    const pendientes = total - completadas;
    const puntosTotales = tareasSemana.reduce((sum, t) => sum + (t.complejidad || 0), 0);
    const puntosCompletados = tareasSemana
      .filter(t => t.estado === "TERMINADO")
      .reduce((sum, t) => sum + (t.complejidad || 0), 0);

    const porProyecto = proyectos.map(p => {
      const tareasProy = tareasSemana.filter(t => t.proyectoId === p.identificador);
      return {
        ...p,
        count: tareasProy.length,
        puntos: tareasProy.reduce((sum, t) => sum + (t.complejidad || 0), 0)
      };
    }).filter(p => p.count > 0);

    const porPersona = personas.map(p => {
      const tareasPers = tareasSemana.filter(t => t.personaAsignadaId === p.identificador);
      return {
        ...p,
        count: tareasPers.length,
        puntos: tareasPers.reduce((sum, t) => sum + (t.complejidad || 0), 0)
      };
    }).filter(p => p.count > 0);

    return {
      total,
      completadas,
      pendientes,
      puntosTotales,
      puntosCompletados,
      porProyecto,
      porPersona,
      progreso: total > 0 ? Math.round((completadas / total) * 100) : 0,
      progresoPuntos: puntosTotales > 0 ? Math.round((puntosCompletados / puntosTotales) * 100) : 0
    };
  }, [tareas, proyectos, personas, semanaId]);

  const rangoSemana = useMemo(() => calcularRangoSemana(semanaId), [semanaId]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Selector de Semana y Resumen */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Rendimiento Semanal</h2>
          <p className="text-lg text-slate-500 font-bold">Estadísticas para la semana {semanaId.split("-W")[1]} ({rangoSemana})</p>
        </div>
      </header>

      {/* Tarjetas de Resumen */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tareas Totales", value: stats.total, unit: "items", sub: `${stats.completadas} completadas`, color: "slate" },
          { label: "Puntos de Esfuerzo", value: stats.puntosTotales, unit: "pts", sub: "Carga Fibonacci", color: "sky" },
          { label: "Progreso Tareas", value: `${stats.progreso}%`, bar: stats.progreso, color: "slate" },
          { label: "Progreso Esfuerzo", value: `${stats.progresoPuntos}%`, bar: stats.progresoPuntos, color: "sky" }
        ].map((c, i) => (
          <div key={i} className="rounded-[40px] border border-white bg-white/80 p-8 shadow-panel backdrop-blur transition-transform hover:scale-[1.02]">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{c.label}</span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-5xl font-black ${c.color === "sky" ? "text-sky-600" : "text-slate-900"}`}>{c.value}</span>
              {c.unit && <span className="text-sm font-bold text-slate-400">{c.unit}</span>}
            </div>
            {c.bar !== undefined ? (
              <div className={`mt-6 h-3 w-full rounded-full overflow-hidden ${c.color === "sky" ? "bg-sky-100" : "bg-slate-100"}`}>
                <div 
                  className={`h-full transition-all duration-1000 ${c.color === "sky" ? "bg-sky-500" : "bg-indigo-500"}`}
                  style={{ width: `${c.bar}%` }}
                />
              </div>
            ) : (
              <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-wider">{c.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Distribución por Proyecto */}
        <section className="rounded-[40px] border border-white bg-white p-10 shadow-panel">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Carga por Proyecto</h3>
            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-black text-slate-500 uppercase">Resumen</span>
          </div>
          <div className="space-y-8">
            {stats.porProyecto.length === 0 ? (
              <p className="text-base text-slate-400 italic">No hay datos por proyecto esta semana.</p>
            ) : (
              stats.porProyecto.map(p => (
                <div key={p.identificador} className="space-y-3">
                  <div className="flex justify-between text-base font-black text-slate-900">
                    <span>{p.nombre}</span>
                    <span className="text-slate-400">{p.puntos} pts</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-50 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000 shadow-inner" 
                      style={{ 
                        width: `${(p.puntos / stats.puntosTotales) * 100}%`,
                        backgroundColor: p.color
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Distribución por Persona - RENDIMIENTO COMPARATIVO */}
        <section className="rounded-[40px] border border-white bg-white p-10 shadow-panel">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rendimiento por Persona</h3>
            <span className="rounded-full bg-sky-50 px-4 py-1 text-xs font-black text-sky-600 uppercase">Esfuerzo</span>
          </div>
          <div className="grid gap-6">
            {stats.porPersona.length === 0 ? (
              <p className="text-base text-slate-400 italic">No hay asignaciones esta semana.</p>
            ) : (
              stats.porPersona.sort((a, b) => b.puntos - a.puntos).map((p, idx) => (
                <div key={p.identificador} className="group relative flex items-center gap-6 rounded-3xl border-2 border-slate-50 bg-white p-5 transition-all hover:border-sky-100 hover:shadow-xl">
                  {/* Rank Badge */}
                  <div className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-xs font-black text-white shadow-lg">
                    #{idx + 1}
                  </div>
                  
                  <div className="h-16 w-16 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center font-black text-xl text-white overflow-hidden" style={{ backgroundColor: p.color || "#0ea5e9" }}>
                    {p.foto ? <img src={p.foto} className="h-full w-full object-cover" /> : p.nombre[0]}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-xl font-black text-slate-900">{p.nombre}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{p.area}</div>
                    
                    {/* Visual bar for comparison within the card */}
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-50 overflow-hidden">
                      <div 
                        className="h-full bg-sky-500 transition-all duration-1000" 
                        style={{ width: `${(p.puntos / (stats.porPersona[0].puntos || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <div className="text-3xl font-black text-sky-600">{p.puntos}</div>
                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Puntos</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
