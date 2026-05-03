import { useAuth } from "./useAuth";
import { getRole, hasPermission, type Permission, type Role } from "@/lib/permissions";

export function usePermission(perm: Permission): boolean {
  const { profile } = useAuth();
  const role = getRole(profile);
  return hasPermission(role, perm);
}

export function useRole(): Role {
  const { profile } = useAuth();
  return getRole(profile);
}
