# ⚙️ Admin API - Configuración y Estadísticas del Sistema

## 📋 Descripción
Los endpoints **Admin** proporcionan herramientas de configuración y análisis para administradores del sistema de gamificación. Incluyen estadísticas globales, configuración de parámetros y dashboards administrativos.

## 🔗 Endpoints Disponibles

### 📊 GET `/api/gamification/admin/stats`
Obtiene estadísticas globales del sistema de gamificación.

**Respuesta:**
```json
{
  "global_stats": {
    "total_users": 150,
    "active_users_30d": 87,
    "total_waros_distributed": 125000,
    "total_activities_completed": 2450,
    "total_achievements_unlocked": 156
  },
  "module_stats": [
    {
      "module_name": "TIR",
      "activities_completed": 1200,
      "waros_distributed": 75000,
      "avg_waros_per_activity": 200,
      "unique_users": 45
    },
    {
      "module_name": "Contabilidad", 
      "activities_completed": 800,
      "waros_distributed": 35000,
      "avg_waros_per_activity": 150
    }
  ],
  "top_performers": [
    {
      "profile_name": "Juan Pérez",
      "total_waros": 5200,
      "activities_completed": 85,
      "achievements_count": 12
    }
  ],
  "recent_achievements": [
    {
      "achievement_name": "Maestro TIR",
      "profile_name": "Ana García",
      "earned_date": "2025-01-08T15:30:00Z",
      "waros_bonus": 2000
    }
  ]
}
```

### ⚙️ GET `/api/gamification/admin/config`
Obtiene la configuración actual del sistema.

**Respuesta:**
```json
{
  "achievements_enabled": true,
  "default_waro_multiplier": 1.0,
  "max_daily_waros": 1000,
  "achievement_cooldown_hours": 24,
  "leaderboard_enabled": true,
  "marketplace_enabled": false,
  "notification_settings": {
    "achievement_notifications": true,
    "waros_notifications": true,
    "leaderboard_updates": false
  }
}
```

### 🔧 POST `/api/gamification/admin/config`
Actualiza la configuración del sistema.

**Request Body:**
```json
{
  "achievements_enabled": true,
  "max_daily_waros": 1500,
  "achievement_cooldown_hours": 12,
  "notification_settings": {
    "achievement_notifications": true,
    "waros_notifications": true
  }
}
```

## 📊 Estadísticas Detalladas

### 🌍 **Métricas Globales**
- **Total de usuarios registrados** en el sistema
- **Usuarios activos** en los últimos 30 días
- **Waros totales distribuidos** histórico
- **Actividades completadas** acumuladas
- **Achievements desbloqueados** totales

### 📈 **Métricas por Módulo**
```json
{
  "tir_module": {
    "activities_completed": 1200,
    "waros_distributed": 240000, // 1200 × 200 promedio
    "avg_waros_per_activity": 200,
    "unique_users": 45,
    "completion_rate": 85.5,
    "growth_30d": 15.2
  }
}
```

### 🏆 **Top Performers**
Ranking de usuarios más activos:
- Por **total de Waros** ganados
- Por **actividades completadas**
- Por **achievements desbloqueados**
- Por **consistencia** (días activos)

### 🎯 **Achievements Recientes**
Stream de logros desbloqueados recientemente:
- Nombre del achievement
- Usuario que lo obtuvo
- Fecha y hora
- Waros bonus otorgados

## ⚙️ Configuración del Sistema

### 🎮 **Parámetros Globales**

#### 🏆 **Control de Achievements**
```json
{
  "achievements_enabled": true, // Activar/desactivar sistema
  "achievement_cooldown_hours": 24, // Tiempo entre achievements similares
  "achievement_verification": "automatic" // automatic | manual
}
```

#### 💰 **Control de Waros**
```json
{
  "default_waro_multiplier": 1.0, // Multiplicador base global
  "max_daily_waros": 1000, // Límite diario por usuario
  "max_weekly_waros": 5000, // Límite semanal por usuario
  "waro_decay_enabled": false // Expiración de Waros (futuro)
}
```

#### 📊 **Features del Sistema**
```json
{
  "leaderboard_enabled": true, // Ranking público
  "marketplace_enabled": false, // Tienda de recompensas
  "social_features": true, // Comparación entre usuarios
  "analytics_tracking": true // Métricas detalladas
}
```

### 🔔 **Configuración de Notificaciones**
```json
{
  "notification_settings": {
    "achievement_notifications": true, // Notificar logros
    "waros_notifications": true, // Notificar Waros ganados
    "leaderboard_updates": false, // Cambios en ranking
    "weekly_summaries": true, // Resumen semanal
    "milestone_alerts": true // Hitos importantes
  }
}
```

## 📊 Dashboard Administrativo

### 🎯 **Métricas de Adopción TIR**
```json
{
  "tir_adoption": {
    "total_tir_users": 45,
    "weekly_new_users": 8,
    "retention_rate_30d": 78.5,
    "avg_analyses_per_user": 26.7,
    "power_users_threshold": 50, // Análisis para ser "power user"
    "power_users_count": 12
  }
}
```

### 📈 **Tendencias de Engagement**
```json
{
  "engagement_trends": {
    "daily_active_users": [45, 52, 48, 61, 58, 55, 49],
    "activities_per_day": [120, 145, 132, 168, 155, 142, 138],
    "waros_distributed_daily": [24000, 29000, 26400, 33600, 31000, 28400, 27600]
  }
}
```

### 🎮 **Health Check del Sistema**
```json
{
  "system_health": {
    "api_response_time": "45ms",
    "database_connections": "healthy",
    "achievements_processing": "active",
    "error_rate_24h": 0.02,
    "last_maintenance": "2025-01-07T02:00:00Z"
  }
}
```

## 🔧 Herramientas Administrativas

### 🎯 **Gestión de Módulos**
```javascript
// Activar/desactivar módulos masivamente
POST /api/gamification/admin/modules/bulk-update
{
  "action": "activate",
  "module_ids": ["tir_module", "accounting_module"],
  "reason": "Q1 2025 focus areas"
}
```

### 🏆 **Gestión de Achievements**
```javascript
// Otorgar achievements manualmente
POST /api/gamification/admin/achievements/manual-grant
{
  "profile_id": "user_id",
  "achievement_id": "special_achievement",
  "reason": "Outstanding TIR analysis quality"
}
```

### 💰 **Ajustes de Waros**
```javascript
// Ajustar balance de usuario
POST /api/gamification/admin/waros/adjust
{
  "profile_id": "user_id", 
  "adjustment": 500,
  "reason": "Compensation for system downtime"
}
```

## 📊 Reportes Avanzados

### 📈 **Reporte de ROI de Gamificación**
```json
{
  "gamification_roi": {
    "period": "Q4 2024",
    "users_with_gamification": 145,
    "users_without_gamification": 55,
    "engagement_lift": 68.5, // % aumento en actividad
    "retention_improvement": 23.2, // % mejora en retención
    "productivity_metrics": {
      "tir_analyses_per_user": {
        "with_gamification": 26.7,
        "without_gamification": 12.3,
        "improvement": 117.1
      }
    }
  }
}
```

### 🎯 **Análisis de Patrones de Uso**
```json
{
  "usage_patterns": {
    "peak_hours": ["09:00-11:00", "14:00-16:00"],
    "peak_days": ["Tuesday", "Wednesday", "Thursday"],
    "seasonal_trends": {
      "q4_increase": 15.5,
      "holiday_dip": -8.2
    },
    "feature_adoption": {
      "tir_module": 89.5,
      "achievements": 76.2,
      "leaderboard": 45.8
    }
  }
}
```

## 🔐 Seguridad y Acceso

### 👑 **Roles Administrativos**
- **Super Admin**: Acceso completo al sistema
- **Tenant Admin**: Administración dentro del tenant
- **Module Admin**: Gestión de módulos específicos
- **Analytics Reader**: Solo lectura de estadísticas

### 🛡️ **Controles de Seguridad**
- ✅ **Autenticación requerida**: Solo admins autorizados
- ✅ **Audit log**: Registro de todas las acciones administrativas
- ✅ **Rate limiting**: Prevención de abuso de APIs
- ✅ **Tenant isolation**: Aislamiento completo de datos

## 📝 Notas Importantes

- **Acceso restringido**: Solo usuarios con rol administrativo
- **Cambios auditados**: Todas las modificaciones se registran
- **Impacto inmediato**: Cambios de configuración se aplican en tiempo real
- **Backup automático**: Configuraciones se respaldan antes de cambios