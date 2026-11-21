"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

/**
 * Product-photography studio, the way cars are shot: one big overhead softbox, two long strip
 * lights that draw clean highlights down the trailer's flanks and trims, a cool rim from behind
 * and a warm card for fill. Reflections are what make paint and metal read as real.
 */
export function StudioEnv({ resolution = 256, warm = "#ffd9a8", bg = "#0d0f12" }: { resolution?: number; warm?: string; bg?: string }) {
  return (
    <Environment resolution={resolution} frames={1}>
      <color attach="background" args={[bg]} />
      {/* overhead softbox */}
      <Lightformer form="rect" intensity={2.6} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={[14, 5, 1]} />
      {/* strip lights either side, long and thin: the highlight lines along the body */}
      <Lightformer form="rect" intensity={3.2} position={[0, 2.2, 7]} rotation-y={Math.PI} scale={[18, 0.5, 1]} />
      <Lightformer form="rect" intensity={2.2} position={[0, 3.4, -7]} scale={[18, 0.35, 1]} />
      {/* rim from behind and a warm fill card */}
      <Lightformer form="rect" intensity={1.6} color="#cfe0ff" position={[-9, 3, 0]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
      <Lightformer form="rect" intensity={1.3} color={warm} position={[9, 1.6, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      {/* soft ground bounce */}
      <Lightformer form="rect" intensity={0.5} color="#bfb6a6" position={[0, -1, 0]} rotation-x={-Math.PI / 2} scale={[20, 20, 1]} />
    </Environment>
  );
}

/**
 * The finishing pass on laptops: ambient occlusion where parts meet (the single biggest cue that
 * steel is touching steel), neutral product tone mapping and edge smoothing.
 * Phones skip it and use the renderer's own tone mapping instead.
 */
export function Finish({ ao = 1, vignette = false }: { ao?: number; vignette?: boolean }) {
  // tone mapping happens once, at the end of the pass; the renderer must not do it as well
  const gl = useThree((st) => st.gl);
  useEffect(() => {
    const prev = gl.toneMapping;
    gl.toneMapping = THREE.NoToneMapping;
    return () => {
      gl.toneMapping = prev;
    };
  }, [gl]);
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={0.55} distanceFalloff={0.6} intensity={2.4 * ao} quality="medium" halfRes />
      {/* Khronos PBR Neutral: made for product shots, and it leaves the page's paper colour as it is */}
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      {vignette ? <Vignette eskil={false} offset={0.28} darkness={0.42} /> : <></>}
      <SMAA />
    </EffectComposer>
  );
}

/** Renderer setup shared by every scene: neutral tone mapping when there is no finishing pass. */
export function setupRenderer(gl: THREE.WebGLRenderer) {
  gl.toneMapping = THREE.NeutralToneMapping;
  gl.toneMappingExposure = 1;
}
