import type { NextRequest } from './shim/next-server';

export type RouteContext = {
  params: Promise<Record<string, string | string[]>>;
};
export type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Response | Promise<Response>;

export interface RouteModule {
  GET?: RouteHandler;
  POST?: RouteHandler;
  PUT?: RouteHandler;
  PATCH?: RouteHandler;
  DELETE?: RouteHandler;
  OPTIONS?: RouteHandler;
}
