import React, { useEffect, useRef, useState } from 'react'

export default function Background() {
  const canvasRef = useRef(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isNewYear: false
  })

  // Timer logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date('2026-01-01T00:00:00').getTime()
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isNewYear: true
        })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isNewYear: false
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  // Canvas animation
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

        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      snowflakes.push(new Snowflake())
    }

    const animate = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#1e3c72')
      gradient.addColorStop(0.5, '#2a5298')
      gradient.addColorStop(1, '#7aa8d1')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      for (let i = 0; i < 50; i++) {
        const starX = (i * 73) % canvas.width
        const starY = (i * 97) % (canvas.height * 0.3)
        const size = Math.sin(Date.now() * 0.001 + i) * 0.5 + 1
        ctx.beginPath()
        ctx.arc(starX, starY, size, 0, Math.PI * 2)
        ctx.fill()
      }

      snowflakes.forEach(flake => {
        flake.update()
        flake.draw()
      })

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

      ctx.fillStyle = 'rgba(240, 248, 255, 0.5)'
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20)

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const TimeUnit = ({ value }) => (
    <div className="relative inline-block">
      <style>{`
        @keyframes wobble {
          0%, 100% { transform: skewX(-2deg); }
          50% { transform: skewX(2deg); }
        }

        .time-number {
          font-family: 'Comic Sans MS', 'Trebuchet MS', cursive, sans-serif;
          font-weight: 900;
          font-size: 5rem;
          text-shadow: 
            -3px -3px 0 rgba(100, 200, 255, 0.8),
            3px -3px 0 rgba(100, 200, 255, 0.8),
            -3px 3px 0 rgba(100, 200, 255, 0.8),
            3px 3px 0 rgba(100, 200, 255, 0.8),
            0 0 20px rgba(173, 216, 230, 0.6);
          animation: wobble 0.5s ease-in-out infinite;
          background: linear-gradient(135deg, #ffffff 0%, #e0f2ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.1em;
        }
      `}</style>

      <div className="time-number">
        {String(value).padStart(2, '0')}
      </div>
    </div>
  )

  return (
    <div className="absolute z-[0] w-full h-full overflow-hidden bg-gradient-to-b from-blue-900 to-blue-400">
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

      {/* Timer Container */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        {timeLeft.isNewYear ? (
          <div className="text-center">
            <style>{`
              @keyframes celebrate {
                0% { transform: scale(0.5) rotateZ(-10deg); opacity: 0; }
                50% { transform: scale(1.1) rotateZ(5deg); }
                100% { transform: scale(1) rotateZ(0deg); opacity: 1; }
              }

              @keyframes float-up {
                0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
                100% { transform: translateY(-100px) rotateZ(360deg); opacity: 0; }
              }

              .happy-text {
                font-family: 'Comic Sans MS', 'Impact', cursive, sans-serif;
                font-size: 6rem;
                font-weight: 900;
                background: linear-gradient(45deg, #ff1744, #f50057, #d50000, #ffeb3b, #00e676);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: celebrate 1s ease-out;
                text-shadow: 0 0 30px rgba(255, 23, 68, 0.8);
                letter-spacing: 0.05em;
              }

              .celebration-particle {
                position: absolute;
                animation: float-up 2s ease-out forwards;
                font-size: 2rem;
              }
            `}</style>

            <h1 className="happy-text drop-shadow-2xl">
              🎉 Happy New Year! 🎉
            </h1>

            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="celebration-particle"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 200}px`,
                  top: `${Math.random() * 100}px`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              >
                {['🎆', '🎇', '✨', '🌟', '⭐'][Math.floor(Math.random() * 5)]}
              </div>
            ))}

            <div className="text-4xl text-white mt-8 animate-bounce" style={{ textShadow: '0 0 20px rgba(255,255,255,0.8)' }}>
              2026 🚀
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex gap-4 md:gap-8 items-center">
              <TimeUnit value={timeLeft.days} />
              <div className="text-5xl text-cyan-300 animate-pulse" style={{ textShadow: '0 0 10px rgba(100,200,255,0.8)' }}>:</div>
              <TimeUnit value={timeLeft.hours} />
              <div className="text-5xl text-cyan-300 animate-pulse" style={{ textShadow: '0 0 10px rgba(100,200,255,0.8)' }}>:</div>
              <TimeUnit value={timeLeft.minutes} />
              <div className="text-5xl text-cyan-300 animate-pulse" style={{ textShadow: '0 0 10px rgba(100,200,255,0.8)' }}>:</div>
              <TimeUnit value={timeLeft.seconds} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}