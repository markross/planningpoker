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

interface Rocket {
  x: number
  y: number
  vy: number
  targetY: number
  exploded: boolean
  color: string
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

function createParticles(x: number, y: number, color: string): readonly Particle[] {
  const count = 30 + Math.floor(Math.random() * 20)
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 1 + Math.random() * 3
    const maxLife = 40 + Math.floor(Math.random() * 30)
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: maxLife,
      maxLife,
      color,
      size: 1.5 + Math.random() * 1.5,
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

    let animationId: number
    let rockets: Rocket[] = []
    let particles: Particle[] = []
    let frameCount = 0
    const duration = 180 // ~3 seconds at 60fps

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener('resize', resize)

    function launchRocket() {
      if (!canvas) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      rockets.push({
        x: w * 0.2 + Math.random() * w * 0.6,
        y: h,
        vy: -(4 + Math.random() * 3),
        targetY: h * 0.15 + Math.random() * h * 0.35,
        exploded: false,
        color: randomColor(),
      })
    }

    // Launch initial burst
    for (let i = 0; i < 3; i++) {
      setTimeout(() => launchRocket(), i * 200)
    }

    function tick() {
      if (!canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      ctx.clearRect(0, 0, w, h)
      frameCount++

      // Launch more rockets periodically
      if (frameCount < 120 && frameCount % 25 === 0) {
        launchRocket()
      }

      // Update rockets
      rockets = rockets.filter((r) => {
        if (r.exploded) return false
        r.y += r.vy
        // Draw rocket trail
        ctx!.beginPath()
        ctx!.arc(r.x, r.y, 2, 0, Math.PI * 2)
        ctx!.fillStyle = r.color
        ctx!.fill()

        if (r.y <= r.targetY) {
          r.exploded = true
          particles = [...particles, ...createParticles(r.x, r.y, r.color)]
          return false
        }
        return true
      })

      // Update particles
      particles = particles.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05 // gravity
        p.vx *= 0.99 // drag
        p.life--

        const alpha = p.life / p.maxLife
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx!.fillStyle = p.color
        ctx!.globalAlpha = alpha
        ctx!.fill()
        ctx!.globalAlpha = 1

        return p.life > 0
      })

      if (frameCount < duration || particles.length > 0 || rockets.length > 0) {
        animationId = requestAnimationFrame(tick)
      }
    }

    animationId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  )
}
