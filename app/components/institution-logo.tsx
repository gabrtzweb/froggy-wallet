"use client";

import { useMemo, useState } from "react";
import { createFallbackLogoDataUrl, getInstitutionLogoUrl } from "@/app/lib/institution-utils";

type InstitutionLogoProps = {
  institutionName: string;
  institutionDomain?: string;
  small?: boolean;
};

export function InstitutionLogo({ institutionName, institutionDomain = "", small = false }: InstitutionLogoProps) {
  const [useFallbackSource, setUseFallbackSource] = useState(false);
  const fallbackSource = useMemo(() => createFallbackLogoDataUrl(institutionName), [institutionName]);
  const source = useFallbackSource || !institutionDomain ? fallbackSource : getInstitutionLogoUrl(institutionDomain);

  return (
    <span className={`institutionLogo ${small ? "institutionLogoSm" : ""}`} aria-hidden="true">
      <img
        className="institutionLogoImage"
        src={source}
        alt=""
        aria-hidden="true"
        width={small ? 28 : 34}
        height={small ? 28 : 34}
        onError={() => {
          setUseFallbackSource(true);
        }}
        loading={small ? "lazy" : "eager"}
        decoding="async"
      />
    </span>
  );
}