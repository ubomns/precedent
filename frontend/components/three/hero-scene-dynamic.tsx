"use client";

import dynamic from "next/dynamic";
import { HeroFallback } from "./fallback";
import type { HeroSceneProps } from "./hero-scene";

const HeroScene = dynamic(() => import("./hero-scene"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

export function HeroSceneDynamic(props: HeroSceneProps) {
  return <HeroScene {...props} />;
}
