import dotenv from 'dotenv'
dotenv.config()

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import bcrypt from 'bcrypt'
import { prisma } from './routes/db.ts' // Prisma client
import { generateToken, verifyToken } from './routes/auth.ts' // JWT helpers
import { WebSocketServer, WebSocket } from 'ws'
import http, { IncomingMessage, ServerResponse } from 'http'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// --------------------
// REGISTER
// --------------------
app.post('/register', async (ctx) => {
  try {
    const { username, password } = await ctx.req.json()
    if (!username || !password)
      return ctx.json({ error: 'Username and password required' }, 400)

    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser) return ctx.json({ error: 'Username already exists' }, 409)

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    })
    return ctx.json({ id: user.id, username: user.username })
  } catch (error) {
    console.error('Register error:', error)
    return ctx.json({ error: 'Internal Server Error' }, 500)
  }
})

// --------------------
// LOGIN
// --------------------
app.post('/login', async (ctx) => {
  try {
    const { username, password } = await ctx.req.json()
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return ctx.json({ error: 'Invalid credentials' }, 401)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return ctx.json({ error: 'Invalid credentials' }, 401)

    const token = generateToken(user.id, user.username)
    return ctx.json({ token })
  } catch (error) {
    console.error('Login error:', error)
    return ctx.json({ error: 'Internal Server Error' }, 500)
  }
})

// --------------------
// JWT Middleware
// --------------------
async function authMiddleware(ctx: any, next: any) {
  const auth = ctx.req.header('Authorization')
  if (!auth) return ctx.json({ error: 'No auth token' }, 401)

  const token = auth.split(' ')[1]
  if (!token) return ctx.json({ error: 'No auth token' }, 401)

  try {
    const payload = verifyToken(token) as { userId: number; username: string }
    ;(ctx.req as any).ctx = { user: payload }
    await next()
  } catch {
    return ctx.json({ error: 'Invalid token' }, 401)
  }
}

// Apply middleware
app.use('/cameras/*', authMiddleware)
app.use('/alerts', authMiddleware)

// --------------------
// GET CAMERAS
// --------------------
app.get('/cameras', async (ctx) => {
  const user = (ctx.req as any).ctx?.user
  if (!user) return ctx.json({ error: 'Unauthorized' }, 401)

  const cameras = await prisma.camera.findMany({ where: { userId: user.userId } })
  return ctx.json(cameras)
})

// --------------------
// CREATE CAMERA
// --------------------
app.post('/cameras', async (ctx) => {
  const user = (ctx.req as any).ctx?.user
  if (!user) return ctx.json({ error: 'Unauthorized' }, 401)

  const data = await ctx.req.json()

  const camera = await prisma.camera.create({
    data: {
      userId: user.userId,
      name: data.name,
      location: data.location,
      rtspUrl: data.rtspUrl,
      enabled: true,
    },
  })

  // Create test alert
  const alert = await prisma.alert.create({
    data: {
      cameraId: camera.id,
      message: 'Test alert: motion detected',
    },
  })

  broadcastAlert(alert)
  return ctx.json(camera)
})

// --------------------
// UPDATE CAMERA
// --------------------
app.patch('/cameras/:id', async (ctx) => {
  const user = (ctx.req as any).ctx?.user
  if (!user) return ctx.json({ error: 'Unauthorized' }, 401)

  const { id } = ctx.req.param()
  const data = await ctx.req.json()

  const camera = await prisma.camera.findUnique({ where: { id: Number(id) } })
  if (!camera || camera.userId !== user.userId)
    return ctx.json({ error: 'Camera not found' }, 404)

  const updatedCamera = await prisma.camera.update({
    where: { id: Number(id) },
    data: {
      name: data.name ?? camera.name,
      location: data.location ?? camera.location,
      rtspUrl: data.rtspUrl ?? camera.rtspUrl,
      enabled: data.enabled ?? camera.enabled,
    },
  })

  return ctx.json(updatedCamera)
})

// --------------------
// DELETE CAMERA
// --------------------
app.delete('/cameras/:id', async (ctx) => {
  const user = (ctx.req as any).ctx?.user
  if (!user) return ctx.json({ error: 'Unauthorized' }, 401)

  const { id } = ctx.req.param()
  const camera = await prisma.camera.findUnique({ where: { id: Number(id) } })
  if (!camera || camera.userId !== user.userId)
    return ctx.json({ error: 'Camera not found' }, 404)

  await prisma.alert.deleteMany({ where: { cameraId: Number(id) } })
  await prisma.camera.delete({ where: { id: Number(id) } })

  return ctx.json({ message: 'Camera deleted successfully' })
})

// --------------------
// GET ALERTS
// --------------------
app.get('/alerts', async (ctx) => {
  const user = (ctx.req as any).ctx?.user
  if (!user) return ctx.json({ error: 'Unauthorized' }, 401)

  const cameras = await prisma.camera.findMany({
    where: { userId: user.userId },
    select: { id: true },
  })
  const cameraIds = cameras.map((c) => c.id)
  if (cameraIds.length === 0) return ctx.json([])

  const alerts = await prisma.alert.findMany({
    where: { cameraId: { in: cameraIds } },
    orderBy: { createdAt: 'desc' },
  })
  return ctx.json(alerts)
})

// --------------------
// WEBSOCKET SERVER
// --------------------
const wss = new WebSocketServer({ port: 3001 })
const clients = new Set<WebSocket>()

wss.on('connection', (ws) => {
  clients.add(ws)
  console.log('WebSocket client connected')

  ws.on('close', () => {
    clients.delete(ws)
    console.log('WebSocket client disconnected')
  })
})

export function broadcastAlert(alert: any) {
  const data = JSON.stringify(alert)
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data)
  })
}

// --------------------
// NODE HTTP SERVER
// --------------------
const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  const chunks: Uint8Array[] = []
  req.on('data', (chunk) => chunks.push(chunk))
  req.on('end', async () => {
    try {
      const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined
      const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: req.headers as HeadersInit,
        body,
      })

      const response = await app.fetch(request)
      res.writeHead(response.status, Object.fromEntries(response.headers))
      const arrayBuffer = await response.arrayBuffer()
      res.end(Buffer.from(arrayBuffer))
    } catch (e) {
      console.error('HTTP server error:', e)
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  })
})

server.listen(3000, () => console.log('Backend running on http://localhost:3000'))
wss.on('listening', () => console.log('WebSocket running on ws://localhost:3001'))
