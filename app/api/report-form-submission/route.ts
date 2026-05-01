import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import nodemailer from 'nodemailer'
import pool from '@/lib/mysql'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'autorevealed.com@gmail.com'
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerEmail,
      vehicleIdentifier,
      vehicleType,
      packageId,
      amount,
      currency,
    } = body

    // Validate required fields
    if (!customerEmail || !vehicleIdentifier || !vehicleType || !packageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Map package ID to name
    const packageNames = {
      basic: 'Basic Report',
      standard: 'Standard Report',
      premium: 'Premium Report',
    }

    const packageName = packageNames[packageId as keyof typeof packageNames] || packageId

    // Generate HTML email for admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #780000; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #780000; }
            .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #780000; display: inline-block; width: 150px; }
            .value { color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Report Request Received</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>A new vehicle report request has been submitted. Here are the details:</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="label">Customer Email:</span>
                  <span class="value">${customerEmail}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Vehicle Type:</span>
                  <span class="value">${vehicleType}</span>
                </div>
                <div class="detail-row">
                  <span class="label">VIN / License Plate:</span>
                  <span class="value">${vehicleIdentifier}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Package Selected:</span>
                  <span class="value">${packageName}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Amount:</span>
                  <span class="value">${currency} ${Number(amount).toFixed(2)}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Submitted At:</span>
                  <span class="value">${new Date().toLocaleString()}</span>
                </div>
              </div>

              <p style="margin-top: 20px; color: #666; font-size: 14px;">
                <strong>Next Step:</strong> The customer will proceed to payment. Once they complete the payment, you'll receive another notification with the payment confirmation details.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AutoRevealed. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to admin
    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `New Report Request - ${packageName}`,
        html: adminEmailHtml,
      })

      console.log('✅ Report submission email sent to admin')
    } catch (emailError) {
      console.warn('⚠️ Failed to send email:', emailError)
      // Continue even if email fails
    }

    // Save submission to database (optional, for record keeping)
    try {
      await pool.query(
        `INSERT INTO report_submissions (
          customer_email, vehicle_identifier, vehicle_type,
          package_id, amount, currency, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [customerEmail, vehicleIdentifier, vehicleType, packageId, amount, currency]
      )
      console.log('✅ Submission saved to database')
    } catch (dbError) {
      console.warn('⚠️ Failed to save submission to database:', dbError)
      // Continue even if DB save fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Report request submitted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error processing report submission:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    )
  }
}
