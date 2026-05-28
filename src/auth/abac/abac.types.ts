// Las acciones posibles en tu sistema
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Los recursos sobre los que aplicarás reglas
export enum Resource {
  USER = 'user',
}

// La estructura de lo que recibirá cada regla de validación
export interface ActionContext {
  user: any; // El payload del JWT (req.user) con el sub, roles, etc.
  resource: any; // El objeto real que se quiere manipular (sacado de la BD)
}

// El tipo que define a una función de política
export type PolicyFn = (context: ActionContext) => boolean;