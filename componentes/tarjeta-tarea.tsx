"use client";

import { useState } from "react";
import { AvatarPersona } from "@/componentes/avatar-persona";
import { formatearFechaCorta, formatearFechaMedia } from "@/lib/tareas";
import type { Persona, PrioridadTarea, Tarea } from "@/tipos/tareas";

type PropiedadesTarjetaTarea = {
  tarea: Tarea;
  personaAsignada: Persona | null;
  arrastrable: boolean;
  estaArrastrando: boolean;
  onAbrir: () => void;
  onEditarTitulo: (identificador: string, titulo: string) => void;
  onIniciarArrastre: () => void;
  onFinalizarArrastre: () => void;
};

const estilosPrioridad: Record<PrioridadTarea, string> = {
  BAJA: "bg-slate-100 text-slate-700",
  MEDIA: "bg-sky-100 text-sky-800",
  ALTA: "bg-amber-100 text-amber-900",
  URGENTE: "bg-rose-100 text-rose-900"
};

export function TarjetaTarea({
  tarea,
  personaAsignada,
  arrastrable,
  estaArrastrando,
  onAbrir,
  onEditarTitulo,
  onIniciarArrastre,
  onFinalizarArrastre
}: PropiedadesTarjetaTarea) {
  const [edicionRapida, setEdicionRapida] = useState(false);
  const [tituloTemporal, setTituloTemporal] = useState(tarea.titulo);

  function guardarTitulo() {
    onEditarTitulo(tarea.identificador, tituloTemporal);
    setEdicionRapida(false);
  }

  return (
    <article
      draggable={arrastrable && !edicionRapida}
      onDragStart={() => onIniciarArrastre()}
      onDragEnd={onFinalizarArrastre}
      onClick={() => {
        if (!edicionRapida) {
          onAbrir();
        }
      }}
      className={`group rounded-[24px] border border-white bg-white p-4 shadow-tarjeta transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
        estaArrastrando ? "scale-[0.98] opacity-40" : "opacity-100"
      } ${arrastrable ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            {tarea.identificador}
          </span>
          {edicionRapida ? (
            <div className="space-y-2">
              <input
                value={tituloTemporal}
                onChange={(evento) => setTituloTemporal(evento.target.value)}
                onClick={(evento) => evento.stopPropagation()}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none ring-0 transition focus:border-sky-400"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(evento) => {
                    evento.stopPropagation();
                    guardarTitulo();
                  }}
                  className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={(evento) => {
                    evento.stopPropagation();
                    setTituloTemporal(tarea.titulo);
                    setEdicionRapida(false);
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(evento) => {
                evento.stopPropagation();
                onAbrir();
              }}
              className="text-left text-[15px] font-semibold leading-5 text-slate-900 transition group-hover:text-slate-950"
            >
              {tarea.titulo}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(evento) => {
            evento.stopPropagation();
            setEdicionRapida(true);
          }}
          className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
        >
          Editar
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${estilosPrioridad[tarea.prioridad]}`}
        >
          {tarea.prioridad}
        </span>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-800">
          {tarea.tipo}
        </span>
      </div>

      {personaAsignada ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2">
          <AvatarPersona
            nombre={personaAsignada.nombre}
            foto={personaAsignada.foto}
            tamano="mini"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-800">
              {personaAsignada.nombre}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {personaAsignada.area}
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <div className="flex items-center justify-between gap-2">
          <span>Creada</span>
          <span className="font-medium text-slate-700">
            {formatearFechaCorta(tarea.fechaCreacion)}
          </span>
        </div>
        {tarea.fechaDeseableFin ? (
          <div className="flex items-center justify-between gap-2">
            <span>Fecha deseable</span>
            <span
              title={formatearFechaMedia(tarea.fechaDeseableFin)}
              className="font-medium text-slate-700"
            >
              {formatearFechaCorta(tarea.fechaDeseableFin)}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
