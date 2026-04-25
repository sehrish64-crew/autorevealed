import { NextRequest, NextResponse } from 'next/server'
import { deleteOrder, updateOrderDetails } from '@/lib/database'
import { validateToken } from '@/lib/auth'

export async function DELETE(request: NextRequest, context: any) {
  try {
    const params = await context.params
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log(`🔐 DELETE /api/admin/orders/[id] - Validating token`)
    if (!token || !(await validateToken(token))) {
      console.error('❌ Unauthorized DELETE request')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params?.id)
    console.log(`📝 DELETE request for order ID: ${id}`)
    
    if (isNaN(id)) {
      console.warn('❌ Invalid order id received in DELETE:', params?.id)
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 })
    }

    console.log(`🗑️ Executing deleteOrder(${id})`)
    await deleteOrder(id)
    console.log(`✅ Order ${id} deleted successfully`)
    
    return NextResponse.json({ success: true, message: `Order ${id} deleted` })
  } catch (err) {
    console.error('❌ Failed to delete order:', err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: 'Failed to delete order', details: errorMsg }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: any) {
  try {
    const params = await context.params
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log(`🔐 PATCH /api/admin/orders/[id] - Validating token`)
    if (!token || !(await validateToken(token))) {
      console.error('❌ Unauthorized PATCH request')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const id = Number(params?.id)
    console.log(`📝 PATCH request for order ID: ${id}`)
    
    if (isNaN(id)) {
      console.warn('❌ Invalid order id received in PATCH:', params?.id)
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 })
    }

    const body = await request.json()
    console.log(`📋 PATCH body:`, body)
    
    // Only allow specific fields to be updated
    const allowed: any = {}
    const keys = ['customer_email','vehicle_type','package_type','vin_number','country_code','state','currency','amount','report_url','payment_status']
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        allowed[k] = body[k]
      }
    }

    console.log(`🔄 Updating order ${id} with:`, allowed)
    const updated = await updateOrderDetails(id, allowed)
    console.log(`✅ Order ${id} updated successfully`, updated)
    
    return NextResponse.json({ success: true, order: updated })
  } catch (err) {
    console.error('❌ Failed to update order:', err)
    const errorMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: 'Failed to update order', details: errorMsg }, { status: 500 })
  }
} 