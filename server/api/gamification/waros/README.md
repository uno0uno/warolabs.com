# 💰 Waros API - Sistema de Moneda Virtual

## 📋 Descripción
Los **Waros** son la moneda virtual del sistema de gamificación. Representan el progreso y logros profesionales de los usuarios, acumulándose en billeteras digitales con historial completo de transacciones.

## 🔗 Endpoints Disponibles

### 🏦 GET `/api/gamification/waros/balance/[profile_id]`
Obtiene el balance completo de Waros de un usuario.

**Respuesta:**
```json
{
  "wallet": {
    "id": "wallet_id",
    "profile_id": "user_id",
    "current_balance": 1250,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-08T15:30:00Z"
  },
  "profile_name": "Juan Pérez",
  "profile_avatar": "avatar_url",
  "stats": {
    "total_earned": 1500,
    "total_spent": 250,
    "transaction_count": 15,
    "achievements_count": 3
  }
}
```

### 💸 POST `/api/gamification/waros/assign`
**🎯 ENDPOINT PRINCIPAL** - Asigna Waros por completar actividades.

**Request Body:**
```json
{
  "profile_id": "user_id",
  "activity_id": "activity_id",
  "description": "Análisis TIR complejo completado",
  "metadata": {
    "project_name": "Investment Analysis",
    "tir_result": 15.5,
    "time_spent": 45
  }
}
```

**Respuesta:**
```json
{
  "message": "Waros asignados exitosamente",
  "transaction": {
    "id": "transaction_id",
    "waros_amount": 200,
    "balance_after": 1450,
    "activity_id": "activity_id",
    "description": "Análisis TIR complejo completado"
  },
  "new_balance": 1450,
  "waros_earned": 200,
  "module_multiplier": 2.0
}
```

### 📊 GET `/api/gamification/waros/transactions`
Obtiene el historial de transacciones de Waros.

**Query Parameters:**
- `profile_id`: ID del usuario
- `limit`: Número de transacciones (default: 50)
- `offset`: Paginación

**Respuesta:**
```json
[
  {
    "id": "transaction_id",
    "transaction_type": "earned",
    "waros_amount": 200,
    "balance_after": 1450,
    "description": "Waros ganados por actividad: Análisis TIR Complejo",
    "metadata": {"project": "Investment X"},
    "created_at": "2025-01-08T15:30:00Z"
  }
]
```

## 🎮 Cómo Funciona

### 💰 Cálculo Automático de Waros
```
Waros Finales = Activity.base_waros × Module.waro_multiplier
```

**Ejemplo TIR:**
- Actividad: "Análisis TIR Complejo" → 100 base_waros
- Módulo TIR: multiplicador 2.0x
- **Resultado: 200 Waros finales**

### 🔄 Flujo Completo

1. **Usuario completa actividad** en dashboard TIR
2. **Frontend llama** `/api/gamification/waros/assign`
3. **Sistema automáticamente**:
   - Busca la actividad y módulo
   - Calcula Waros finales
   - Actualiza billetera
   - Registra transacción
   - Verifica achievements (futuro)

### 🏦 Gestión de Billeteras

**Creación Automática:**
- Si el usuario no tiene billetera, se crea automáticamente
- Balance inicial: 0 Waros
- Aislamiento por tenant garantizado

**Tipos de Transacciones:**
- `earned`: Waros ganados por actividades
- `bonus`: Waros extra por achievements
- `spent`: Waros usados en recompensas (futuro)

## 📊 Dashboard de Usuario

### 📈 Estadísticas Disponibles
- **Balance Actual**: Waros disponibles ahora
- **Total Ganado**: Suma histórica de todos los Waros
- **Total Gastado**: Waros invertidos en beneficios
- **Conteo de Transacciones**: Número total de movimientos
- **Achievements**: Logros desbloqueados

### 🎯 Ejemplos de Uso en TIR

```javascript
// En tu dashboard TIR localhost:8080
async function completeTIRAnalysis(analysisData) {
  // Tu lógica actual del TIR...
  
  // GAMIFICACIÓN: Asignar Waros automáticamente
  const response = await $fetch('/api/gamification/waros/assign', {
    method: 'POST',
    body: {
      profile_id: currentUser.id,
      activity_id: 'tir_complex_analysis', // ID configurado previamente
      description: `TIR Analysis: ${analysisData.project_name}`,
      metadata: {
        tir_result: analysisData.tir_value,
        investment: analysisData.initial_investment,
        duration: analysisData.years
      }
    }
  })
  
  // Usuario recibe notificación automática
  console.log(`🎉 ¡Ganaste ${response.waros_earned} Waros!`)
}
```

## 🔐 Seguridad

- ✅ **Multi-tenant isolation**: Solo billeteras del tenant actual
- ✅ **Transacciones ACID**: Rollback automático en errores
- ✅ **Validación de actividades**: Solo actividades válidas y activas
- ✅ **Integridad de balance**: Cálculos matemáticos verificados
- ✅ **Auditoria completa**: Historial inmutable de transacciones

## 🎆 Características Avanzadas

### 🏆 Achievements Automáticos (Futuro)
Al asignar Waros, el sistema verificará automáticamente:
- Logros por cantidad de actividades
- Logros por días consecutivos  
- Logros por puntos acumulados
- Waros bonus adicionales

### 📊 Analytics y Métricas
Cada transacción incluye:
- IP address del usuario
- User agent para analytics
- Metadata personalizable
- Timestamps precisos

## 📝 Notas Importantes

- **Endpoint único**: `/assign` es el único punto de entrada para Waros
- **Sin parámetro manual**: Los Waros se calculan automáticamente
- **Billeteras automáticas**: Se crean sin intervención del usuario
- **Historial inmutable**: Las transacciones no se pueden modificar