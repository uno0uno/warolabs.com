# 🛒 Marketplace API - Tienda de Recompensas con Waros

## 📋 Descripción
El **Marketplace** es la tienda virtual donde los usuarios pueden gastar sus Waros ganados en beneficios reales, recompensas digitales y ventajas profesionales. Transforma la moneda virtual en valor tangible.

## 🔗 Endpoints Disponibles

### 🛍️ GET `/api/gamification/marketplace/items`
Obtiene todos los productos disponibles en el marketplace.

**Respuesta:**
```json
[
  {
    "id": "premium_access_item",
    "item_name": "Acceso Premium TIR",
    "item_description": "Acceso a herramientas avanzadas de análisis TIR por 30 días",
    "waro_cost": 500,
    "item_type": "digital_access",
    "category": "professional_tools",
    "duration_days": 30,
    "benefits": [
      "Templates TIR avanzados",
      "Análisis de sensibilidad",
      "Reportes ejecutivos",
      "Soporte prioritario"
    ],
    "stock_available": null,
    "is_available": true,
    "popularity_score": 85
  },
  {
    "id": "certification_item",
    "item_name": "Certificación TIR Expert",
    "waro_cost": 2000,
    "item_type": "certification",
    "requirements": {
      "min_analyses": 50,
      "min_waros_earned": 5000
    }
  },
  {
    "id": "coffee_voucher",
    "item_name": "Voucher Café Premium",
    "waro_cost": 150,
    "item_type": "physical_reward",
    "stock_available": 25
  }
]
```

### 💳 POST `/api/gamification/marketplace/purchase`
Realiza una compra en el marketplace.

**Request Body:**
```json
{
  "profile_id": "user_id",
  "item_id": "premium_access_item",
  "quantity": 1,
  "delivery_info": {
    "email": "user@example.com",
    "preference": "immediate_activation"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Compra realizada exitosamente",
  "purchase": {
    "id": "purchase_id",
    "item_name": "Acceso Premium TIR", 
    "waros_spent": 500,
    "new_balance": 750,
    "activation_code": "PREM-TIR-2025-ABC123",
    "expires_at": "2025-02-08T00:00:00Z"
  },
  "transaction": {
    "id": "transaction_id",
    "transaction_type": "spent",
    "waros_amount": 500,
    "balance_after": 750
  }
}
```

## 🛍️ Categorías de Productos

### 💻 **Herramientas Digitales**
Accesos premium y funcionalidades avanzadas:

```json
{
  "category": "digital_tools",
  "items": [
    {
      "item_name": "TIR Pro Templates",
      "waro_cost": 300,
      "description": "Plantillas profesionales para análisis TIR complejos",
      "benefits": ["10 templates premium", "Personalización avanzada"]
    },
    {
      "item_name": "Dashboard Analytics Plus",
      "waro_cost": 400,
      "description": "Métricas avanzadas y reportes personalizados"
    }
  ]
}
```

### 🎓 **Certificaciones Profesionales**
Reconocimientos oficiales de experticia:

```json
{
  "category": "certifications",
  "items": [
    {
      "item_name": "Certificación TIR Expert",
      "waro_cost": 2000,
      "requirements": {
        "min_tir_analyses": 50,
        "min_waros_from_tir": 5000,
        "min_achievements": 10
      },
      "benefits": [
        "Certificado oficial PDF",
        "Badge LinkedIn verificado",
        "Acceso a comunidad exclusiva"
      ]
    },
    {
      "item_name": "Certificación Financial Analyst", 
      "waro_cost": 3500,
      "requirements": {
        "multiple_modules": ["tir", "accounting", "finance"],
        "min_total_waros": 10000
      }
    }
  ]
}
```

### 🎁 **Recompensas Físicas**
Productos tangibles y experiencias:

```json
{
  "category": "physical_rewards",
  "items": [
    {
      "item_name": "Voucher Café Premium",
      "waro_cost": 150,
      "stock_available": 50,
      "delivery_method": "email_voucher"
    },
    {
      "item_name": "Kit Home Office",
      "waro_cost": 1200,
      "description": "Mouse ergonómico + teclado + pad premium",
      "shipping_required": true
    }
  ]
}
```

### ⚡ **Ventajas Temporales**
Beneficios por tiempo limitado:

```json
{
  "category": "temporary_perks",
  "items": [
    {
      "item_name": "Multiplicador Waros 2x",
      "waro_cost": 800,
      "duration_hours": 24,
      "description": "Duplica Waros ganados por 24 horas"
    },
    {
      "item_name": "Skip Cooldown",
      "waro_cost": 200,
      "description": "Elimina tiempo de espera entre achievements"
    }
  ]
}
```

## 💳 Sistema de Compras

### 🔄 **Flujo de Compra**
1. **Usuario navega** el marketplace
2. **Selecciona producto** deseado
3. **Verifica balance** de Waros suficiente
4. **Confirma compra** con detalles de entrega
5. **Sistema procesa**:
   - Deduce Waros de billetera
   - Registra transacción
   - Activa beneficio o envía producto
   - Genera código/voucher si aplica

### 💰 **Gestión de Transacciones**
```javascript
// Ejemplo de transacción de compra
{
  "transaction_type": "spent",
  "waros_amount": 500,
  "balance_before": 1250,
  "balance_after": 750,
  "purchase_id": "purchase_123",
  "item_description": "Acceso Premium TIR - 30 días"
}
```

### 🎫 **Códigos de Activación**
```json
{
  "activation_system": {
    "format": "PREF-TYPE-YEAR-RANDOM", 
    "example": "PREM-TIR-2025-ABC123",
    "validity_period": "30 days",
    "single_use": true,
    "user_binding": true
  }
}
```

## 🎯 Ejemplos Específicos TIR

### 🚀 **Marketplace TIR Profesional**
```json
[
  {
    "item_name": "TIR Calculator Pro",
    "waro_cost": 600,
    "description": "Calculadora avanzada con simulaciones Monte Carlo",
    "features": [
      "Análisis de sensibilidad automático",
      "Gráficos profesionales",
      "Export a Excel/PDF",
      "Comparación de escenarios"
    ]
  },
  {
    "item_name": "Mentoring Session TIR",
    "waro_cost": 1500,
    "description": "1 hora de mentoría con experto en análisis financiero",
    "delivery": "video_call_scheduled"
  },
  {
    "item_name": "Biblioteca TIR Cases", 
    "waro_cost": 400,
    "description": "50 casos reales de análisis TIR de diferentes industrias"
  }
]
```

### 🏆 **Recompensas por Logros**
```json
{
  "achievement_rewards": [
    {
      "trigger": "first_tir_analysis",
      "free_item": "TIR Beginner Guide",
      "message": "¡Felicitaciones! Recibe esta guía gratuita"
    },
    {
      "trigger": "tir_expert_achievement", 
      "discount": 50,
      "applicable_to": "certification_items",
      "message": "50% descuento en certificaciones por ser Experto TIR"
    }
  ]
}
```

## 📊 Analytics y Métricas

### 📈 **Métricas de Marketplace**
```json
{
  "marketplace_analytics": {
    "total_purchases": 1247,
    "total_waros_spent": 425000,
    "avg_purchase_value": 341,
    "top_selling_items": [
      {"item": "Premium Access", "sales": 156},
      {"item": "Café Vouchers", "sales": 89},
      {"item": "TIR Templates", "sales": 67}
    ],
    "conversion_rate": 23.5, // % usuarios que compran
    "repeat_purchase_rate": 34.2
  }
}
```

### 🎯 **Segmentación de Usuarios**
```json
{
  "user_segments": {
    "high_spenders": {
      "definition": "> 2000 Waros gastados",
      "count": 45,
      "favorite_category": "certifications"
    },
    "casual_buyers": {
      "definition": "100-500 Waros gastados", 
      "count": 156,
      "favorite_category": "physical_rewards"
    },
    "savers": {
      "definition": "> 1000 Waros sin gastar",
      "count": 67,
      "opportunity": "targeted_promotions"
    }
  }
}
```

## 🔐 Validaciones y Seguridad

### ✅ **Validaciones de Compra**
- **Balance suficiente**: Verificar Waros disponibles
- **Stock disponible**: Para productos limitados
- **Requisitos cumplidos**: Para certificaciones
- **Límites por usuario**: Evitar abuso del sistema
- **Duplicados**: Prevenir compras repetidas innecesarias

### 🛡️ **Seguridad Transaccional**
- **Transacciones ACID**: Rollback en caso de error
- **Auditoria completa**: Log de todas las compras
- **Fraud detection**: Patrones sospechosos
- **Rate limiting**: Prevenir spam de compras

## 🎮 Gamificación del Marketplace

### 🎁 **Promociones Especiales**
```json
{
  "flash_sales": {
    "duration": "24 hours",
    "discount": 30,
    "trigger": "weekend_special"
  },
  "bundle_deals": {
    "tir_complete_pack": {
      "items": ["tir_templates", "premium_access", "certification_prep"],
      "individual_cost": 1400,
      "bundle_cost": 1000,
      "savings": 400
    }
  }
}
```

### 🏆 **Loyalty Program**
```json
{
  "vip_tiers": {
    "bronze": {
      "requirement": "500 Waros spent",
      "benefit": "5% discount on all items"
    },
    "silver": {
      "requirement": "2000 Waros spent", 
      "benefit": "10% discount + early access"
    },
    "gold": {
      "requirement": "5000 Waros spent",
      "benefit": "15% discount + exclusive items"
    }
  }
}
```

## 📝 Notas Importantes

- **No reembolsos**: Las compras con Waros son finales
- **Códigos únicos**: Cada compra genera códigos irrepetibles  
- **Expiración**: Algunos beneficios tienen fecha de vencimiento
- **Transferencias**: Los productos no son transferibles entre usuarios
- **Actualizaciones**: El catálogo se actualiza mensualmente