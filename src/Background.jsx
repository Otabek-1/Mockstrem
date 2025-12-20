import React, { useEffect, useRef } from 'react'

export default function Background() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const snowflakes = []
    const particleCount = 150

    class Snowflake {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height - canvas.height
        this.vx = Math.random() * 2 - 1
        this.vy = Math.random() * 1 + 1
        this.radius = Math.random() * 3 + 1
        this.opacity = Math.random() * 0.5 + 0.3
        this.wobble = Math.random() * Math.PI * 2
        this.wobbleSpeed = Math.random() * 0.05 + 0.02
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.wobble += this.wobbleSpeed
        this.x += Math.sin(this.wobble) * 0.5

        // Wind effect
        this.vx += (Math.random() - 0.5) * 0.1

        if (this.x > canvas.width) {
          this.x = 0
          this.y = -10
        }
        if (this.x < 0) {
          this.x = canvas.width
          this.y = -10
        }
        if (this.y > canvas.height) {
          this.x = Math.random() * canvas.width
          this.y = -10
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw snowflake glow
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // Initialize snowflakes
    for (let i = 0; i < particleCount; i++) {
      snowflakes.push(new Snowflake())
    }

    // Animation loop
    const animate = () => {
      // Gradient background with animation
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#1e3c72')
      gradient.addColorStop(0.5, '#2a5298')
      gradient.addColorStop(1, '#7aa8d1')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw distant stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      for (let i = 0; i < 50; i++) {
        const starX = (i * 73) % canvas.width
        const starY = (i * 97) % (canvas.height * 0.3)
        const size = Math.sin(Date.now() * 0.001 + i) * 0.5 + 1
        ctx.beginPath()
        ctx.arc(starX, starY, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Update and draw snowflakes
      snowflakes.forEach(flake => {
        flake.update()
        flake.draw()
      })

      // Draw aurora effect (northern lights)
      ctx.globalAlpha = 0.3
      const auroraGradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      auroraGradient.addColorStop(0, 'rgba(0, 255, 150, 0)')
      auroraGradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.4)')
      auroraGradient.addColorStop(1, 'rgba(0, 255, 150, 0)')
      
      ctx.fillStyle = auroraGradient
      for (let i = 0; i < 3; i++) {
        const wave = Math.sin(Date.now() * 0.0005 + i) * 50
        ctx.fillRect(0, 100 + i * 60 + wave, canvas.width, 40)
      }
      ctx.globalAlpha = 1

      // Draw snowdrifts at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      for (let x = 0; x <= canvas.width; x += 30) {
        const drift = Math.sin(x * 0.01 + Date.now() * 0.0002) * 20
        ctx.lineTo(x, canvas.height - 30 + drift)
      }
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(0, canvas.height)
      ctx.closePath()
      ctx.fill()

      // Accumulated snow layer at bottom
      ctx.fillStyle = 'rgba(240, 248, 255, 0.5)'
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20)

      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="absolute w-full h-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-400">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
      
      {/* Floating ice crystals */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 animate-pulse">
          <div className="text-6xl opacity-20">❄️</div>
        </div>
        <div className="absolute top-1/4 right-20 animate-bounce" style={{ animationDuration: '6s' }}>
          <div className="text-5xl opacity-30">❄️</div>
        </div>
        <div className="absolute top-1/3 left-1/4 animate-pulse" style={{ animationDuration: '3s' }}>
          <div className="text-4xl opacity-25">❄️</div>
        </div>
        <div className="absolute top-1/2 right-1/3 animate-bounce" style={{ animationDuration: '8s' }}>
          <div className="text-5xl opacity-20">❄️</div>
        </div>
        <div className="absolute top-2/3 left-1/3 animate-pulse" style={{ animationDuration: '4s' }}>
          <div className="text-4xl opacity-30">❄️</div>
        </div>
      </div>

      {/* Light rays effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-screen opacity-0 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-200 rounded-full mix-blend-screen opacity-0 animate-pulse" style={{ animationDuration: '5s' }}></div>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-900 opacity-40 pointer-events-none"></div>
    </div>
  )
}