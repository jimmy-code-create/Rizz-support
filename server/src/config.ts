import path from 'node:path';

function resolveFromCwd(value: string): string {
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
}

export interface AppConfig {
  port: number;
  dataDir: string;
  adminToken: string | null;
  clientDist: string;
  isProduction: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = Number.parseInt(env.PORT ?? '3000', 10);
  const adminToken = env.SUPPORT_ADMIN_TOKEN?.trim();

  return {
    port: Number.isFinite(port) && port > 0 ? port : 3000,
    dataDir: resolveFromCwd(env.DATA_DIR ?? './data'),
    adminToken: adminToken && adminToken.length >= 16 ? adminToken : null,
    clientDist: resolveFromCwd(env.CLIENT_DIST ?? './client/dist'),
    isProduction: env.NODE_ENV === 'production',
  };
}
