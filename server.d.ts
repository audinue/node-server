export type ServeConfig = {
  fetch: (request: Request) => Response | Promise<Response>
  port?: number
  error?: (request: Request, error: any) => Response | Promise<Response>
  serverError?: (error: any) => void
}

export type Server = {
  destroy(): Promise<void>
}

export let serve: (config: ServeConfig) => Promise<Server>
