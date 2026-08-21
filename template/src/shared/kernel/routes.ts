export const ROUTES = {
  AUTH: {
    ROOT: "/",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
  },
} as const;

export const PUBLIC_ROUTES = [ROUTES.AUTH.ROOT] as const;
export const PROTECTED_ROUTES = [ROUTES.DASHBOARD.ROOT] as const;
