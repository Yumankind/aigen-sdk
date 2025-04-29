// Example of creating a print-on-demand order with Gelato API
// This example uses the Aigen SDK to generate an image and the Gelato API to create an order for that design

// Import required modules
import AigenSDK from 'aigen-sdk'
import fetch from 'node-fetch'

//Get your secret from your AI Gen account (https://aigen.run) - "My Secret Keys" on the top right corner
//If you don't have an account, you can sign up for free (no credit card required) and get free credits to start
const AIGEN_SECRET = 'AaA/BbB/CcC'

// Gelato API configuration
const GELATO_API_KEY = 'your_gelato_api_key'
const GELATO_API_URL = 'https://order.gelatoapis.com/v4/orders'

// Initialize Aigen SDK with your secret

const aigen = new AigenSDK(AIGEN_SECRET)

// Generate a custom design with Aigen
async function generateCustomDesign(instagramUsername) {
  // Generating the URL of the image doesn't cost any credits
  const imageUrl = await aigen.generateImage('Create art in line art style for a t-shirt design. Return only the image to print on the t-shirt.', {
    width: 768,
    height: 1024,
    model: 'gpt-image-1@openai',
    profile: `instagram:${instagramUsername}`
  })
  
  console.log('Generated design URL:', imageUrl)
  return imageUrl
}

// Create an order with Gelato
async function createGelatoOrder(designUrl) {
  const orderData = {
    orderType: "order",
    orderReferenceId: "order-" + Date.now(),
    customerReferenceId: "customer-123",
    currency: "USD",
    items: [
      {
        itemReferenceId: "item-" + Date.now(),
        productUid: "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_classic_gsi_s_gco_white_gpr_4-4",
        files: [
          {
            type: "default",
            url: designUrl
          }
        ],
        quantity: 1
      }
    ],
    shipmentMethodUid: "express",
    shippingAddress: {
      companyName: "Example",
      firstName: "Paul",
      lastName: "Smith",
      addressLine1: "451 Clarkson Ave",
      addressLine2: "Brooklyn",
      state: "NY",
      city: "New York",
      postCode: "11203",
      country: "US",
      email: "apisupport@gelato.com",
      phone: "123456789"
    },
    returnAddress: {
      companyName: "My company",
      addressLine1: "3333 Saint Marys Avenue",
      addressLine2: "Brooklyn",
      state: "NY",
      city: "New York",
      postCode: "13202",
      country: "US",
      email: "apisupport@gelato.com",
      phone: "123456789"
    },
  }

  try {
    const response = await fetch(GELATO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': GELATO_API_KEY
      },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()
    console.log('Gelato order created:', result)
    return result
  } catch (error) {
    console.error('Error creating Gelato order:', error)
    throw error
  }
}

// Main function to run the example
async function main(instagramUsername) {
  try {
    // First generate the design
    const designUrl = await generateCustomDesign(instagramUsername)
    
    // Then create the order with Gelato
    const order = await createGelatoOrder(designUrl)
    
    console.log('Order process completed successfully')
    console.log('Order Information:', order)
  } catch (error) {
    console.error('Error processing order:', error)
  }
}

// Execute the example
main('arianagrande')