import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
]

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

function createBurst(x: number, y: number): readonly Particle[] {
  const color = randomColor()
  const count = 40 + Math.floor(Math.random() * 20)
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 5
    const maxLife = 50 + Math.floor(Math.random() * 40)
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
      color,
      size: 2 + Math.random() * 2,
    }
  })
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId = 0
    let cancelled = false
    let particles: Particle[] = []
    let frameCount = 0

    function resize() {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    function spawnBurst() {
      if (!canvas) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const x = w * 0.15 + Math.random() * w * 0.7
      const y = h * 0.1 + Math.random() * h * 0.4
      particles = [...particles, ...createBurst(x, y)]
    }

    // Immediate burst on mount
    spawnBurst()
    spawnBurst()
    spawnBurst()

    // Schedule more bursts
    const timers = [
      setTimeout(() => { if (!cancelled) { spawnBurst(); spawnBurst() } }, 300),
      setTimeout(() => { if (!cancelled) { spawnBurst(); spawnBurst() } }, 700),
      setTimeout(() => { if (!cancelled) { spawnBurst() } }, 1100),
      setTimeout(() => { if (!cancelled) { spawnBurst() } }, 1500),
    ]

    function tick() {
      if (cancelled || !canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      ctx.clearRect(0, 0, w, h)
      frameCount++

      particles = particles.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.06 // gravity
        p.vx *= 0.98 // drag
        p.life--

        const alpha = Math.max(0, p.life / p.maxLife)
        const radius = p.size * (0.3 + 0.7 * alpha)

        ctx!.globalAlpha = alpha
        ctx!.fillStyle = p.color
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx!.fill()

        return p.life > 0
      })

      ctx.globalAlpha = 1

      if (frameCount < 200 || particles.length > 0) {
        animationId = requestAnimationFrame(tick)
      }
    }

    animationId = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(animationId)
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  )
}
