// Stub API that provides FunctionReference-like objects for development
// The actual API types are generated from the Convex backend
const createFunctionReference = (path: string) => ({
  __isBuiltin: true,
  __name: path,
} as any);

export const api = new Proxy({}, {
  get: (_, namespace) => new Proxy({}, {
    get: (_, fn) => createFunctionReference(`${String(namespace)}.${String(fn)}`)
  })
});

export const internal = api;
export const components = {};
