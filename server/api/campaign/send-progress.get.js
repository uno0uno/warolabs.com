import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  // Set SSE headers
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Headers', 'Cache-Control')

  // Get session ID from query params
  const { sessionId } = getQuery(event)
  
  if (!sessionId) {
    event.node.res.write('data: {"error": "sessionId required"}\n\n')
    event.node.res.end()
    return
  }

  // Keep connection alive
  const keepAlive = setInterval(() => {
    event.node.res.write(': heartbeat\n\n')
  }, 30000)

  // Listen for progress events specific to this session
  const progressListener = (data) => {
    if (data.sessionId === sessionId) {
      event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
      
      // Close connection when complete
      if (data.type === 'complete' || data.type === 'error') {
        clearInterval(keepAlive)
        event.node.res.end()
      }
    }
  }

  // Store the listener globally (in a real app, use Redis/database)
  if (!global.sseListeners) {
    global.sseListeners = new Set()
  }
  global.sseListeners.add(progressListener)

  // Clean up on client disconnect
  event.node.req.on('close', () => {
    clearInterval(keepAlive)
    global.sseListeners.delete(progressListener)
  })

  // Send initial connection confirmation
  event.node.res.write(`data: ${JSON.stringify({
    type: 'connected',
    sessionId,
    timestamp: new Date().toISOString()
  })}\n\n`)
})

// Helper function to emit progress events
export function emitProgress(data) {
  if (global.sseListeners) {
    global.sseListeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error('Error emitting SSE progress:', error)
      }
    })
  }
}