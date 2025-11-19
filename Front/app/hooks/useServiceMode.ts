import { useState } from "react";
import { ServiceMode, SERVICE_MODE_CONFIG } from "../constants/ServiceModes";

export const useServiceMode = (initialMode: ServiceMode = "PW") => {
  const [serviceMode, setServiceMode] = useState<ServiceMode>(initialMode);
  const currentMode = SERVICE_MODE_CONFIG[serviceMode];

  const switchMode = (mode: ServiceMode) => {
    setServiceMode(mode);
  };

  return {
    serviceMode,
    setServiceMode,
    currentMode,
    switchMode,
  };
};

