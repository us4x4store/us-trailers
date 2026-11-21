"use client";
import { useEffect } from "react";

export default function OpenBuild({ href }: { href: string }) {
  useEffect(() => {
    location.replace(href);
  }, [href]);
  return null;
}
