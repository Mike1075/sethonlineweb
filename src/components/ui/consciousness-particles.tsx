'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  velocity: { x: number; y: number }
  color: string
}

interface ConsciousnessParticlesProps {
  count?: number
  className?: string
}

export function ConsciousnessParticles({ 
  count = 50, 
  className = "" 
}: ConsciousnessParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  const colors = [
    'rgba(217, 166, 89, 0.6)',  // Seth gold
    'rgba(64, 153, 140, 0.5)',  // Seth accent
    'rgba(166, 115, 64, 0.4)',  // Seth secondary
    'rgba(241, 245, 249, 0.3)', // Seth light
  ]

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const rect = container.getBoundingClientRect()

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      velocity: {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      },
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    const animate = () => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.velocity.x
        particle.y += particle.velocity.y

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= rect.width) {
          particle.velocity.x *= -1
        }
        if (particle.y <= 0 || particle.y >= rect.height) {
          particle.velocity.y *= -1
        }

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(rect.width, particle.x))
        particle.y = Math.max(0, Math.min(rect.height, particle.y))

        // Subtle opacity pulsing
        particle.opacity = 0.3 + Math.sin(Date.now() * 0.001 + particle.id) * 0.3
      })

      // Trigger re-render
      if (containerRef.current) {
        const particles = containerRef.current.querySelectorAll('.particle')
        particles.forEach((element, index) => {
          const particle = particlesRef.current[index]
          if (particle && element instanceof HTMLElement) {
            element.style.transform = `translate(${particle.x}px, ${particle.y}px)`
            element.style.opacity = particle.opacity.toString()
          }
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [count])

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {particlesRef.current.map((particle) => (
        <div
          key={particle.id}
          className="particle absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            transform: `translate(${particle.x}px, ${particle.y}px)`,
          }}
        />
      ))}
    </div>
  )
}

// Typing indicator with consciousness theme
export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2 px-4 py-3">
      <div className="text-sm text-seth-accent">赛斯正在思考</div>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-seth-gold rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Consciousness glow effect
export function ConsciousnessGlow({ 
  children, 
  intensity = 1,
  className = "" 
}: {
  children: React.ReactNode
  intensity?: number
  className?: string
}) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05 }}
      animate={{
        boxShadow: [
          `0 0 ${20 * intensity}px rgba(64, 153, 140, 0.3)`,
          `0 0 ${40 * intensity}px rgba(217, 166, 89, 0.2)`,
          `0 0 ${20 * intensity}px rgba(64, 153, 140, 0.3)`,
        ],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}