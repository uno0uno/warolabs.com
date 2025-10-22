# 🎯 Activities API - Gestión de Actividades de Gamificación

## 📋 Descripción
Las **Activities** son las tareas específicas que los usuarios pueden completar para ganar Waros. Cada actividad pertenece a un módulo y tiene puntos base que se multiplican por el factor del módulo.

## 🔗 Endpoints Disponibles

### 📖 GET `/api/gamification/activities`
Obtiene todas las actividades del tenant con información del módulo.

**Respuesta:**
```json
[
  {
    "id": "activity_id",
    "activity_name": "Análisis TIR Complejo",
    "activity_description": "Análisis completo de TIR con múltiples escenarios",
    "base_waros": 100,
    "module_id": "tir_module_id",
    "module_name": "TIR",
    "module_key": "tir",
    "module_type": "financial_analysis",
    "module_multiplier": 2.0,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### ➕ POST `/api/gamification/activities`
Crea una nueva actividad.

**Request Body:**
```json
{
  "module_id": "module_id",
  "activity_name": "Nombre de la Actividad",
  "activity_description": "Descripción opcional",
  "waro_points": 100,
  "is_active": true
}
```

**Respuesta:**
```json
{
  "message": "Actividad creada exitosamente",
  "activity": {
    "id": "new_activity_id",
    "activity_name": "Nombre de la Actividad",
    "base_waros": 100,
    "module_id": "module_id"
  }
}
```

### ✏️ PUT `/api/gamification/activities/[id]`
Actualiza una actividad existente.

### 🗑️ DELETE `/api/gamification/activities/[id]`
Elimina una actividad.

## 🎮 Cómo Funcionan

### 💰 Cálculo de Waros
```
Waros Finales = base_waros × module_multiplier
```

**Ejemplo:**
- Actividad: "Análisis TIR Complejo" → 100 base_waros
- Módulo TIR: multiplicador 2.0x
- **Resultado: 100 × 2.0 = 200 Waros finales**

### 🔄 Flujo de Uso

1. **Crear módulo** con multiplicador específico
2. **Crear actividades** dentro del módulo
3. **Asignar Waros** usando `/api/gamification/waros/assign`
4. El sistema calcula automáticamente los Waros finales

## 📊 Ejemplos de Actividades TIR

```json
{
  "module_id": "tir_module",
  "activity_name": "TIR Análisis Básico",
  "base_waros": 50,
  "description": "Cálculo simple de TIR"
}

{
  "module_id": "tir_module", 
  "activity_name": "TIR Análisis Avanzado",
  "base_waros": 100,
  "description": "Análisis TIR con múltiples escenarios"
}

{
  "module_id": "tir_module",
  "activity_name": "TIR con Flujos Complejos", 
  "base_waros": 150,
  "description": "TIR con flujos de caja irregulares"
}
```

## 🔐 Seguridad
- ✅ **Multi-tenant isolation**: Solo actividades del tenant actual
- ✅ **Validación de módulos**: Verifica que el módulo pertenezca al tenant
- ✅ **Campos requeridos**: module_id, activity_name, waro_points

## 📝 Notas
- Las actividades **inactivas** (`is_active: false`) no aparecen en listados
- Los `base_waros` se almacenan en la columna `base_waros` de la tabla
- El multiplicador se aplica automáticamente al asignar Waros