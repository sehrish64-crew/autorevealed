#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
const PADDLE_CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const priceId = 'pri_01kg4gy97s9knjqxs7nw1t7dyy';

console.log('🔑 PADDLE_API_KEY:', PADDLE_API_KEY?.substring(0, 20) + '...');
console.log('🎫 CLIENT_TOKEN:', PADDLE_CLIENT_TOKEN?.substring(0, 20) + '...');
console.log('💰 Price ID:', priceId);

const payload = {
  items: [
    {
      price_id: priceId,
      quantity: 1,
    },
  ],
};

console.log('\n📤 Test 1: Using Bearer API Key...');
console.log('Payload:', JSON.stringify(payload, null, 2));

fetch('https://sandbox-api.paddle.com/checkouts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PADDLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then((res) => {
    console.log('\n📥 Response Status:', res.status, res.statusText);
    return res.json().then((json) => ({ status: res.status, json }));
  })
  .then(({ status, json }) => {
    console.log('✅ Response Body:', JSON.stringify(json, null, 2));
    if (json?.data?.id) {
      console.log('🎉 Checkout URL:', `https://checkout.paddle.com/${json.data.id}`);
    } else if (json?.error) {
      console.log('❌ Error:', json.error);
    }
  })
  .catch((err) => {
    console.error('❌ Fetch Error:', err.message);
  });
