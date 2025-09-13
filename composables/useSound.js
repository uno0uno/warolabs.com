export const useSound = () => {
  const playWaterDropSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Crear oscilador principal
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      // Mismas frecuencias bajas pero duración más larga
      oscillator.frequency.setValueAtTime(500, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(350, audioContext.currentTime + 0.08)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.25)
      
      oscillator.type = 'sine'
      
      // Volumen bajo pero con decay más largo
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.02) // Volumen bajo
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4) // Decay muy largo
      
      // Conectar nodos
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Reproducir con duración más larga
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
      
    } catch (error) {
      console.warn('No se pudo reproducir el sonido:', error)
    }
  }

  const playNotificationSound = (type = 'success') => {
    // Usar sonido de gota de agua para todas las notificaciones
    playWaterDropSound()
  }
  
  return {
    playNotificationSound
  }
}