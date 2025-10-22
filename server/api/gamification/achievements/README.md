# 🏆 Achievements API - Sistema de Logros Automáticos

## 📋 Descripción
Los **Achievements** son logros automáticos que se desbloquean cuando los usuarios cumplen condiciones específicas. Proporcionan reconocimiento, badges y Waros bonus adicionales para motivar el progreso continuo.

## 🔗 Endpoints Disponibles

### 📖 GET `/api/gamification/achievements`
Obtiene todos los achievements disponibles del tenant.

**Respuesta:**
```json
[
  {
    "id": "first_tir_achievement",
    "achievement_name": "Primer Análisis TIR",
    "achievement_description": "Completa tu primer análisis de TIR",
    "badge_icon": "🎯",
    "waro_reward": 100,
    "condition_type": "count",
    "condition_operator": ">=",
    "condition_value": 1,
    "module_id": "tir_module_id",
    "is_active": true,
    "rarity": "common"
  },
  {
    "id": "tir_expert_achievement",
    "achievement_name": "Experto TIR",
    "badge_icon": "👑",
    "waro_reward": 500,
    "condition_type": "count", 
    "condition_value": 25,
    "rarity": "rare"
  }
]
```

### ➕ POST `/api/gamification/achievements`
Crea un nuevo achievement.

**Request Body:**
```json
{
  "achievement_name": "Maestro TIR",
  "achievement_description": "Completa 100 análisis TIR exitosos",
  "badge_icon": "🔥",
  "waro_reward": 1000,
  "condition_type": "count",
  "condition_operator": ">=", 
  "condition_value": 100,
  "module_id": "tir_module_id",
  "rarity": "legendary",
  "is_active": true
}
```

### ✏️ PUT `/api/gamification/achievements/[id]`
Actualiza un achievement existente.

### 🗑️ DELETE `/api/gamification/achievements/[id]`
Elimina un achievement.

## 🎮 Sistema de Condiciones Automáticas

### 📊 Tipos de Condiciones

#### 🔢 **COUNT** - Por Cantidad de Actividades
Verifica cuántas actividades ha completado el usuario:

```json
{
  "condition_type": "count",
  "condition_operator": ">=",
  "condition_value": 10,
  "time_period": null // Histórico completo
}
```

**Ejemplos:**
- **"Trabajador Constante"**: ≥ 10 actividades completadas
- **"Experto TIR"**: ≥ 25 análisis TIR
- **"Leyenda"**: ≥ 100 actividades en cualquier módulo

#### ⚡ **STREAK** - Por Días Consecutivos
Verifica actividad diaria consecutiva:

```json
{
  "condition_type": "streak", 
  "condition_operator": ">=",
  "condition_value": 7,
  "time_period": "30 days" // Ventana de verificación
}
```

**Ejemplos:**
- **"Semana Perfecta"**: 7 días activos consecutivos
- **"Mes Imparable"**: 30 días activos consecutivos

### 🔄 Verificación Automática

El sistema verifica achievements **automáticamente** cada vez que se asignan Waros:

```javascript
// Usuario completa actividad TIR
POST /api/gamification/waros/assign
{
  "profile_id": "user123",
  "activity_id": "tir_analysis"
}

// Sistema automáticamente:
// 1. ✅ Asigna 200 Waros por la actividad
// 2. 🔍 Verifica: "¿Es el análisis TIR #25?"
// 3. 🏆 Desbloquea "Experto TIR" + 500 Waros bonus
// 4. 📝 Registra achievement en user_achievements
```

## 🎯 Ejemplos de Achievements TIR

### 🚀 **Progresión Básica**
```json
{
  "achievement_name": "Primera Moneda",
  "condition_value": 1,
  "waro_reward": 25,
  "badge_icon": "🪙"
}

{
  "achievement_name": "Primer Análisis TIR", 
  "condition_value": 1,
  "waro_reward": 50,
  "module_id": "tir_module"
}
```

### 💪 **Progresión Intermedia**
```json
{
  "achievement_name": "Trabajador TIR",
  "condition_value": 10,
  "waro_reward": 200,
  "badge_icon": "⚡"
}

{
  "achievement_name": "Analista Experto",
  "condition_value": 25, 
  "waro_reward": 500,
  "badge_icon": "🎯"
}
```

### 👑 **Progresión Avanzada**
```json
{
  "achievement_name": "Maestro TIR",
  "condition_value": 100,
  "waro_reward": 2000,
  "badge_icon": "👑",
  "rarity": "legendary"
}

{
  "achievement_name": "Leyenda Financiera",
  "condition_value": 500,
  "waro_reward": 10000,
  "badge_icon": "🔥",
  "rarity": "mythic"
}
```

### ⚡ **Achievements de Consistencia**
```json
{
  "achievement_name": "Semana Perfecta",
  "condition_type": "streak",
  "condition_value": 7,
  "waro_reward": 300,
  "badge_icon": "📅"
}

{
  "achievement_name": "Mes Imparable", 
  "condition_type": "streak",
  "condition_value": 30,
  "waro_reward": 1500,
  "badge_icon": "🚀"
}
```

## 🎨 Sistema de Rareza

### 💎 **Niveles de Rareza**
| Rareza | Color | Waros Típicos | Dificultad |
|--------|-------|---------------|------------|
| `common` | Gris | 25-100 | Fácil |
| `uncommon` | Verde | 100-300 | Moderado |
| `rare` | Azul | 300-800 | Difícil |
| `epic` | Morado | 800-2000 | Muy Difícil |
| `legendary` | Dorado | 2000-5000 | Extremo |
| `mythic` | Arcoíris | 5000+ | Legendario |

### 🎭 **Badges y Emojis**
```json
{
  "common": "🏅",
  "uncommon": "🥉", 
  "rare": "🥈",
  "epic": "🥇",
  "legendary": "👑",
  "mythic": "🔥"
}
```

## 🔄 Flujo de Implementación

### 1. 🏗️ Configuración Inicial
```javascript
// Crear achievements progresivos para TIR
const achievements = [
  { name: "Primer TIR", count: 1, reward: 50 },
  { name: "TIR Frecuente", count: 5, reward: 150 },
  { name: "Experto TIR", count: 25, reward: 500 },
  { name: "Maestro TIR", count: 100, reward: 2000 }
]

for (const achievement of achievements) {
  await $fetch('/api/gamification/achievements', {
    method: 'POST',
    body: {
      achievement_name: achievement.name,
      condition_type: "count",
      condition_value: achievement.count,
      waro_reward: achievement.reward,
      module_id: "tir_module_id"
    }
  })
}
```

### 2. 🎮 Activación Automática
```javascript
// En waros/assign.post.js - línea 107
// Descomentar para activar achievements:
await checkAchievementUnlocks(client, profile_id, tenantContext.tenant_id, activity.module_id)
```

## 🏆 User Achievements - Logros Otorgados

### 📊 Estructura de user_achievements
```json
{
  "id": "user_achievement_id",
  "profile_id": "user_id", 
  "achievement_id": "achievement_id",
  "earned_date": "2025-01-08T15:30:00Z",
  "progress_value": 25, // Valor al momento de desbloquearlo
  "bonus_waros_awarded": 500
}
```

### 🎯 Dashboard de Usuario
```javascript
// GET /api/gamification/achievements/user/[profile_id]
{
  "earned_achievements": [
    {
      "achievement_name": "Experto TIR",
      "badge_icon": "🎯", 
      "earned_date": "2025-01-08",
      "rarity": "rare"
    }
  ],
  "progress": [
    {
      "achievement_name": "Maestro TIR",
      "current_progress": 25,
      "target_value": 100,
      "percentage": 25
    }
  ]
}
```

## 🔐 Seguridad y Validación

- ✅ **No duplicados**: Un usuario no puede obtener el mismo achievement dos veces
- ✅ **Validación automática**: Condiciones verificadas matemáticamente
- ✅ **Transacciones ACID**: Achievement + Waros bonus en una sola transacción
- ✅ **Multi-tenant**: Achievements aislados por tenant
- ✅ **Auditoria**: Historial completo de cuándo y cómo se obtuvo cada logro

## 📈 Gamificación Psicológica

### 🎯 **Progresión Visible**
- Barras de progreso hacia próximo achievement
- Notificaciones de logros desbloqueados
- Comparación social (leaderboards futuros)

### 🎮 **Motivación Intrínseca**
- **Reconocimiento**: Badges visibles en perfil
- **Progreso**: Sense of accomplishment
- **Recompensa**: Waros bonus tangibles
- **Exclusividad**: Achievements raros y únicos

## 📝 Notas Importantes

- **Verificación automática**: Solo ocurre al asignar Waros
- **Una sola vez**: Achievements no se pueden duplicar
- **Waros bonus**: Se suman al balance inmediatamente
- **Histórico inmutable**: Los achievements otorgados no se pueden revocar