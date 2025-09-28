import 'hono'

declare module 'hono' {
  interface Env {
    user?: {
      userId: number
      username: string
    }
  }
}
