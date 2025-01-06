export type Fetch = (request: Request) => Response | Promise<Response>

export type ServeConfig = {
  fetch: (request: Request) => Response | Promise<Response>
  port?: number
  error?: (error: any) => Response | Promise<Response>
  serverError?: (error: any) => void
}

export type Server = {
  destroy(): Promise<void>
}

export let serve: (config: ServeConfig) => Promise<Server>
