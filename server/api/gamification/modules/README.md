# 🎯 Modules API - Niveles de Complejidad y Multiplicadores

## 📋 Descripción
Los **Modules** son niveles de complejidad que agrupan actividades similares y aplican multiplicadores a los Waros base. Representan diferentes áreas de trabajo o especialización (TIR, Contabilidad, Finanzas, etc.).

## 🔗 Endpoints Disponibles

### 📖 GET `/api/gamification/modules`
Obtiene todos los módulos del tenant.

**Respuesta:**
```json
[
  {
    "id": "tir_module_id",
    "module_name": "TIR",
    "module_key": "tir",
    "module_type": "financial_analysis",
    "module_description": "Análisis de Tasa Interna de Retorno",
    "waro_multiplier": 2.0,
    "difficulty_level": "ALTA",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "accounting_module_id", 
    "module_name": "Contabilidad",
    "waro_multiplier": 1.5,
    "difficulty_level": "MEDIA"
  },
  {
    "id": "basic_module_id",
    "module_name": "Básico", 
    "waro_multiplier": 1.0,
    "difficulty_level": "BAJA"
  }
]
```

### ➕ POST `/api/gamification/modules`
Crea un nuevo módulo.

**Request Body:**
```json
{
  "module_name": "TIR Avanzado",
  "module_key": "tir_advanced",
  "module_type": "financial_analysis",
  "module_description": "Análisis avanzado de TIR con escenarios complejos",
  "waro_multiplier": 2.5,
  "difficulty_level": "ALTA",
  "is_active": true
}
```

### ✏️ PUT `/api/gamification/modules/[id]`
Actualiza un módulo existente.

## 🎮 Cómo Funcionan los Multiplicadores

### 💰 Sistema de Complejidad
```
Waros Finales = Activity.base_waros × Module.waro_multiplier
```

| Módulo | Complejidad | Multiplicador | Uso |
|--------|-------------|---------------|-----|
| **TIR** | ALTA | **2.0x** | Análisis de inversiones complejas |
| Contabilidad | MEDIA | 1.5x | Estados financieros |
| Finanzas | MEDIA-BAJA | 1.3x | Flujo de caja básico |
| Básico | BAJA | 1.0x | Tareas generales |

### 📊 Ejemplos Prácticos

**Módulo TIR (×2.0):**
- Actividad: "Análisis TIR Complejo" → 100 base_waros
- **Resultado: 100 × 2.0 = 200 Waros finales** 🎯

**Módulo Contabilidad (×1.5):**
- Actividad: "Balance General" → 80 base_waros  
- **Resultado: 80 × 1.5 = 120 Waros finales**

**Módulo Básico (×1.0):**
- Actividad: "Tarea Simple" → 50 base_waros
- **Resultado: 50 × 1.0 = 50 Waros finales**

## 🏗️ Estructura y Configuración

### 🎯 Módulo TIR - Configuración Recomendada
```json
{
  "module_name": "TIR",
  "module_key": "tir", 
  "module_type": "financial_analysis",
  "module_description": "Análisis de Tasa Interna de Retorno - Evaluación de inversiones",
  "waro_multiplier": 2.0,
  "difficulty_level": "ALTA",
  "color_hex": "#8B5CF6",
  "icon": "calculator",
  "is_active": true
}
```

### 📈 Actividades TIR Sugeridas
Dentro del módulo TIR, crear actividades como:

```json
{
  "module_id": "tir_module_id",
  "activity_name": "TIR Análisis Básico",
  "base_waros": 50
}
// Resultado: 50 × 2.0 = 100 Waros

{
  "module_id": "tir_module_id", 
  "activity_name": "TIR Análisis Intermedio",
  "base_waros": 75
}
// Resultado: 75 × 2.0 = 150 Waros

{
  "module_id": "tir_module_id",
  "activity_name": "TIR Análisis Complejo", 
  "base_waros": 100
}
// Resultado: 100 × 2.0 = 200 Waros
```

## 🔄 Flujo de Implementación

### 1. 🏗️ Configuración Inicial
```javascript
// Crear módulo TIR
POST /api/gamification/modules
{
  "module_name": "TIR",
  "waro_multiplier": 2.0,
  "difficulty_level": "ALTA"
}

// Crear actividades dentro del módulo
POST /api/gamification/activities  
{
  "module_id": "tir_module_id",
  "activity_name": "Análisis TIR Complejo",
  "base_waros": 100
}
```

### 2. 🎮 Uso en Dashboard
```javascript
// En dashboard TIR localhost:8080
await $fetch('/api/gamification/waros/assign', {
  method: 'POST',
  body: {
    profile_id: user.id,
    activity_id: 'tir_analysis_activity'
    // Waros se calculan automáticamente: 100 × 2.0 = 200
  }
})
```

## 🎨 Características Visuales

### 🎨 Personalización UI
Los módulos pueden incluir:
- **Colores específicos** para identificación visual
- **Iconos únicos** para cada área de trabajo  
- **Badges de dificultad** (Básico, Intermedio, Avanzado, Experto)
- **Progreso visual** por módulo

### 📊 Dashboard de Módulos
```json
{
  "tir_stats": {
    "activities_completed": 25,
    "total_waros_earned": 5000,
    "average_per_activity": 200,
    "level": "Experto TIR"
  }
}
```

## 🔐 Seguridad y Validación

- ✅ **Multi-tenant isolation**: Solo módulos del tenant actual
- ✅ **Multiplicadores validados**: Entre 0.1x y 10.0x
- ✅ **Claves únicas**: `module_key` debe ser único por tenant
- ✅ **Actividades dependientes**: Eliminar módulo requiere eliminar actividades primero

## 📈 Escalabilidad

### 🚀 Módulos Futuros
- **VPN** (Valor Presente Neto) - Multiplicador 2.2x
- **Flujo de Caja** - Multiplicador 1.4x  
- **Análisis de Riesgo** - Multiplicador 2.5x
- **Reportes Ejecutivos** - Multiplicador 1.8x

### 🎯 Especialización Progresiva
Los usuarios pueden especializarse en módulos específicos:
- **Badges por módulo**: "Experto TIR", "Maestro Contabilidad"
- **Achievements exclusivos** por área de expertise
- **Multipliers personalizados** basados en performance

## 📝 Notas Importantes

- **Multiplicador por defecto**: 1.0x si no se especifica
- **Orden de aplicación**: Los multiplicadores se aplican al asignar Waros
- **Cambios retroactivos**: Modificar multiplicadores NO afecta Waros ya asignados
- **Módulos inactivos**: No aparecen en listados ni permiten nuevas actividades