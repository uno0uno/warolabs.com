import { ref, computed } from 'vue'
import moment from 'moment'
import 'moment-timezone'

// función para establecer la zona horaria
function setColombiaTimeZone(date) {
  return moment(date).tz('America/Bogota')
}

// establece la configuración regional para el idioma español y la zona horaria de Colombia
moment.locale('es-co')

export default function useDate(date) {
  // crea una variable reactiva con la fecha
  const originalDate = ref(date)

  // crea una variable computada con el mes en español
  const month = computed(() => {
    // crea un objeto moment con la fecha y la zona horaria
    const date = setColombiaTimeZone(originalDate.value)
    // devuelve el mes en español
    return date.format('MMMM')
  })

  // crea una variable computada con el día
  const day = computed(() => {
    // crea un objeto moment con la fecha y la zona horaria
    const date = setColombiaTimeZone(originalDate.value)
    // devuelve el día
    return date.format('D')
  })

  // crea una variable computada con la hora y la zona horaria
  const time = computed(() => {
    // crea un objeto moment con la fecha y la zona horaria
    const date = setColombiaTimeZone(originalDate.value)
    // formatea la hora y la zona horaria con A para AM/PM
    let timeString = date.format('h:mm A') + ' ' + date.zoneAbbr()
    // quita el espacio y el número usando replace()
    timeString = timeString.replace(/ -\d+/, '')
    // devuelve la cadena resultante
    return timeString
  })

  // crea una variable computada con el código del país
  const country = computed(() => {
    // adivina la zona horaria del navegador
    const timezone = moment.tz.guess()
    // obtiene el código del país a partir de la zona horaria
    return moment.tz.zone(timezone).countries()[0]
  })

  // devuelve el mes, el día, la hora y la zona horaria
  return { month, day, time, country }
}
