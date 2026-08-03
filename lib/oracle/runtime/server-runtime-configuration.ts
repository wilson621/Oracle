import "server-only";

import {
  resolvePublicRuntimeConfiguration,
} from "./runtime-environment-policy";

export function getServerPublicRuntimeConfiguration() {
  return resolvePublicRuntimeConfiguration(process.env);
}
