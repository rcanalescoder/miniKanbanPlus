"use client";

import { useEffect, useMemo, useState } from "react";
import { crearFotoAvatar } from "@/lib/personas";
import { normalizarUrlImagen } from "@/lib/seguridad";

type PropiedadesAvatarPersona = {
  nombre: string;
  foto: string;
  tamano?: "mini" | "media" | "grande";
};

const clasesTamano = {
  mini: "h-8 w-8 rounded-full",
  media: "h-11 w-11 rounded-2xl",
  grande: "h-14 w-14 rounded-[20px]"
};

export function AvatarPersona({
  nombre,
  foto,
  tamano = "media"
}: PropiedadesAvatarPersona) {
  const [huboError, setHuboError] = useState(false);

  useEffect(() => {
    setHuboError(false);
  }, [foto]);

  const fotoSegura = useMemo(() => {
    const urlNormalizada = normalizarUrlImagen(foto);

    if (!urlNormalizada || huboError) {
      return crearFotoAvatar(nombre, 3);
    }

    return urlNormalizada;
  }, [foto, huboError, nombre]);

  return (
    <img
      src={fotoSegura}
      alt={nombre}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHuboError(true)}
      className={`${clasesTamano[tamano]} border border-white/70 bg-white object-cover shadow-sm`}
    />
  );
}
