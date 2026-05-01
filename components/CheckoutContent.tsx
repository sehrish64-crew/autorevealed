'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/prices'

interface PaymentFormData {
  packageId: 'basic' | 'standard' | 'premium'
  currency: string
  customerEmail: string
  vehicleIdentifier: string
  vehicleType: string
  amount: number
}

export default function CheckoutContent() {
  const router = useRouter()
  const [formData, setFormData] = useState<PaymentFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Retrieve payment form data from sessionStorage
    try {
      const data = sessionStorage.getItem('paymentFormData')
      if (!data) {
        setError('No payment information found. Please fill out the form again.')
        setIsLoading(false)
        return
      }

      const parsedData = JSON.parse(data) as PaymentFormData
      setFormData(parsedData)
      setIsLoading(false)
    } catch (err) {
      setError('Failed to load payment information. Please try again.')
      setIsLoading(false)
      console.error('Error parsing payment data:', err)
    }
  }, [])

  const handlePaymentComplete = (result: any) => {
    console.log('Payment completed:', result)
    // Clear the form data
    sessionStorage.removeItem('paymentFormData')
    // Redirect to success page
    router.push(`/payment-success?orderId=${result.orderId}`)
  }

  const handlePaymentError = (errorMsg: string) => {
    console.error('Payment error:', errorMsg)
    setError(errorMsg)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
          <p className="mt-4 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    )
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'Payment information is missing'}</p>
              <Button
                asChild
                className="w-full bg-red-700 hover:bg-red-800"
              >
                <Link href="/">Go Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-red-700 hover:text-red-800 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Back to Form
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your payment to get your vehicle report</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Method Selector */}
          <div>
            <PaymentMethodSelector
              amount={formData.amount}
              currency={formData.currency}
              packageId={formData.packageId}
              customerEmail={formData.customerEmail}
              vehicleIdentifier={formData.vehicleIdentifier}
              vehicleType={formData.vehicleType}
              onPaymentComplete={handlePaymentComplete}
              onPaymentError={handlePaymentError}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">
                    {formData.packageId === 'basic' ? 'Basic' : formData.packageId === 'standard' ? 'Standard' : 'Premium'} Report
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vehicle: {formData.vehicleIdentifier}
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {formData.vehicleType}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 py-6 border-b border-gray-200">
              <div className="flex justify-between text-gray-700">
                <span>Report Price</span>
                <span className="font-medium">
                  {formatCurrency(formData.amount, formData.currency)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Processing Fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
            </div>

            <div className="py-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-red-700">
                  {formatCurrency(formData.amount, formData.currency)}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>✓ Secure Payment:</strong> Your payment is protected with industry-standard encryption.
              </p>
            </div>

            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
