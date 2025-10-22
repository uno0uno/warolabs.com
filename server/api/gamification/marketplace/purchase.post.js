import { withTenantIsolation, executeWithTenantFilter } from '../../../utils/security/tenantIsolation.js'
import { withPostgresClient } from '../../../utils/basedataSettings/withPostgresClient.js'

export default withTenantIsolation(async (event) => {
  return await executeWithTenantFilter(event, async (tenantContext) => {
    
    const body = await readBody(event)
    const { 
      profile_id,
      item_id,
      quantity = 1
    } = body
    
    // Validate required fields
    if (!profile_id || !item_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Los campos profile_id e item_id son requeridos'
      })
    }
    
    return await withPostgresClient(async (client) => {
      
      // Start transaction
      await client.query('BEGIN')
      
      try {
        // Get item details
        const itemResult = await client.query(`
          SELECT * FROM marketplace_items 
          WHERE id = $1 AND tenant_id = $2 AND is_available = true
        `, [item_id, tenantContext.tenant_id])
        
        if (itemResult.rows.length === 0) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Item no encontrado o no disponible'
          })
        }
        
        const item = itemResult.rows[0]
        const totalCost = item.waro_cost * quantity
        
        // Check user wallet balance
        const walletResult = await client.query(`
          SELECT id, current_balance FROM waros_wallets 
          WHERE profile_id = $1 AND tenant_id = $2
        `, [profile_id, tenantContext.tenant_id])
        
        if (walletResult.rows.length === 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Usuario no tiene billetera de Waros'
          })
        }
        
        const wallet = walletResult.rows[0]
        
        if (wallet.current_balance < totalCost) {
          throw createError({
            statusCode: 400,
            statusMessage: `Waros insuficientes. Necesitas ${totalCost}, tienes ${wallet.current_balance}`
          })
        }
        
        // Check purchase limits
        if (item.max_per_user) {
          const previousPurchasesResult = await client.query(`
            SELECT SUM(quantity) as total_purchased
            FROM marketplace_purchases 
            WHERE profile_id = $1 AND item_id = $2 AND status != 'cancelled'
          `, [profile_id, item_id])
          
          const totalPurchased = parseInt(previousPurchasesResult.rows[0].total_purchased || 0)
          
          if (totalPurchased + quantity > item.max_per_user) {
            throw createError({
              statusCode: 400,
              statusMessage: `Límite excedido. Máximo ${item.max_per_user} por usuario`
            })
          }
        }
        
        // Check stock
        if (item.stock_quantity !== null) {
          if (item.stock_quantity < quantity) {
            throw createError({
              statusCode: 400,
              statusMessage: `Stock insuficiente. Disponible: ${item.stock_quantity}`
            })
          }
          
          // Update stock
          await client.query(`
            UPDATE marketplace_items 
            SET stock_quantity = stock_quantity - $1, updated_at = NOW()
            WHERE id = $2
          `, [quantity, item_id])
        }
        
        // Create purchase record
        const purchaseResult = await client.query(`
          INSERT INTO marketplace_purchases (
            profile_id, item_id, tenant_id, waros_spent, quantity, 
            status, purchased_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING *
        `, [
          profile_id,
          item_id,
          tenantContext.tenant_id,
          totalCost,
          quantity,
          item.requires_approval ? 'pending' : 'completed'
        ])
        
        // Create transaction record for spent Waros
        await client.query(`
          INSERT INTO waros_transactions (
            profile_id, tenant_id, transaction_type, waros_amount,
            balance_after, description, related_entity_type, related_entity_id,
            created_at
          ) VALUES ($1, $2, 'spent', $3, $4, $5, 'marketplace_purchase', $6, NOW())
        `, [
          profile_id,
          tenantContext.tenant_id,
          totalCost,
          wallet.current_balance - totalCost,
          `Compra: ${item.item_name} (x${quantity})`,
          purchaseResult.rows[0].id.toString()
        ])
        
        // Update wallet balance
        await client.query(`
          UPDATE waros_wallets 
          SET 
            current_balance = current_balance - $1,
            lifetime_spent = lifetime_spent + $1,
            updated_at = NOW()
          WHERE id = $2
        `, [totalCost, wallet.id])
        
        // Commit transaction
        await client.query('COMMIT')
        
        return {
          message: 'Compra realizada exitosamente',
          purchase: purchaseResult.rows[0],
          item: item,
          waros_spent: totalCost,
          new_balance: wallet.current_balance - totalCost,
          status: item.requires_approval ? 'pending_approval' : 'completed'
        }
        
      } catch (error) {
        // Rollback transaction
        await client.query('ROLLBACK')
        throw error
      }
    }, event)
  })
})