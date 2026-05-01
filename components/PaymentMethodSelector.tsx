'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { AlertCircle, CreditCard, Loader } from 'lucide-react'
import { formatCurrency } from '@/lib/prices'

interface PaymentMethodSelectorProps {
  amount: number
  currency: string
  packageId: 'basic' | 'standard' | 'premium'
  customerEmail: string
  vehicleIdentifier: string
  vehicleType: string
  onPaymentComplete: (result: any) => void
  onPaymentError: (error: string) => void
}

export function PaymentMethodSelector({
  amount,
  currency,
  packageId,
  customerEmail,
  vehicleIdentifier,
  vehicleType,
  onPaymentComplete,
  onPaymentError,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'card' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleCardPayment = async () => {
    setIsProcessing(true)
    setError('')

    try {
      // For credit/debit card, we'll use PayPal's card processing through their API
      // This would require additional setup with PayPal's payment gateway
      // For now, we'll show a message
      setError('Card payments are currently being configured. Please use PayPal for now.')
      setIsProcessing(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process card payment'
      setError(errorMsg)
      onPaymentError(errorMsg)
      setIsProcessing(false)
    }
  }

  // This function creates the PayPal order
  const createPayPalOrder = async () => {
    try {
      setError('')
      
      const createOrderResponse = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          currency,
          customerEmail,
          vehicleIdentifier,
          vehicleType,
          amount, // Pass the amount explicitly
        }),
      })

      if (!createOrderResponse.ok) {
        let errorMsg = 'Failed to create PayPal order'
        try {
          const errorData = await createOrderResponse.json()
          errorMsg = errorData.error || errorMsg
        } catch {
          errorMsg = `Error ${createOrderResponse.status}: ${createOrderResponse.statusText}`
        }
        throw new Error(errorMsg)
      }

      const orderData = await createOrderResponse.json()
      if (!orderData.orderId) {
        throw new Error('No order ID returned from server')
      }
      return orderData.orderId // Return PayPal order ID
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create PayPal order'
      console.error('❌ PayPal order creation failed:', errorMsg)
      setError(errorMsg)
      onPaymentError(errorMsg)
      throw err
    }
  }

  // This function captures the payment after user approval
  const handlePayPalApprove = async (data: any) => {
    try {
      setIsProcessing(true)
      setError('')

      // Extract the internal order ID from PayPal response
      const referenceId = data.purchase_units?.[0]?.reference_id
      
      // Capture the order
      const captureResponse = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: data.orderID || data.id,
          internalOrderId: referenceId || 'ORD-' + Date.now(),
          customerEmail,
          customerName: 'Valued Customer',
          amount,
          currency,
          packageId,
          vehicleIdentifier,
        }),
      })

      if (!captureResponse.ok) {
        throw new Error('Failed to capture payment')
      }

      const captureData = await captureResponse.json()
      onPaymentComplete(captureData)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMsg)
      onPaymentError(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayPalError = (err: any) => {
    const errorMsg = err?.message || 'PayPal payment failed'
    setError(errorMsg)
    onPaymentError(errorMsg)
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency,
        intent: 'capture',
      }}
    >
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* PayPal Option */}
          <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMethod === 'paypal'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('paypal')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                {selectedMethod === 'paypal' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
              </div>
              <span className="font-semibold text-gray-900">PayPal</span>
            </div>
            <p className="text-sm text-gray-600 ml-9">Fast and secure checkout</p>

            {selectedMethod === 'paypal' && (
              <div className="mt-4 ml-9 space-y-3">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">
                    Amount to charge: <span className="text-lg text-blue-700">{formatCurrency(amount, currency)}</span>
                  </p>
                </div>
                
                {isProcessing ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader className="animate-spin text-blue-600" size={24} />
                    <span className="ml-2 text-gray-600">Processing payment...</span>
                  </div>
                ) : (
                  <PayPalButtons
                    style={{ 
                      layout: 'vertical',
                      color: 'blue',
                    
                      label: 'pay',
                    }}
                    createOrder={async () => {
                      return await createPayPalOrder()
                    }}
                    onApprove={handlePayPalApprove}
                    onError={handlePayPalError}
                    onClick={() => {
                      setError('')
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Credit/Debit Card Option */}
          {/* <div
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all opacity-50 ${
              selectedMethod === 'card'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedMethod('card')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                {selectedMethod === 'card' && <div className="w-3 h-3 bg-green-600 rounded-full" />}
              </div>
              <CreditCard size={20} className="text-gray-600" />
              <span className="font-semibold text-gray-900">Credit / Debit Card</span>
              <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-600 ml-9">Visa, Mastercard, American Express</p>

            {selectedMethod === 'card' && (
              <div className="mt-4 ml-9">
                <Button
                  onClick={handleCardPayment}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : null}
                  Continue with Card
                </Button>
              </div>
            )}
          </div> */}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Your payment information is secure and encrypted
        </p>
      </div>
    </PayPalScriptProvider>
  )
}
