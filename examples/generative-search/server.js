// Example of generative search with Aigen
// This example uses the Aigen SDK to generate different images related to a specific user query
// This way you will never show a "Not found" message to the user and convert the user intent into a purchase

// Import required modules
import AigenSDK from 'aigen-sdk'

//Get your secret from your AI Gen account (https://aigen.run) - "My Secret Keys" on the top right corner
//If you don't have an account, you can sign up for free (no credit card required) and get free credits to start
const AIGEN_SECRET = 'AaA/BbB/CcC'

// Initialize Aigen SDK with your secret
const aigen = new AigenSDK(AIGEN_SECRET)

// Function to generate a random image (using a list of pre-defined prompts)
async function generateRandomProductImage(userQuery) {
  const prompts = [
    `A white t-shirt with a desing inspired on the user query: ${userQuery} The image should be a professional product photo.`,
    `A wall frame inspired by the user query: ${userQuery} The image should be a professional product photo.`,
    `A poster inspired by the user query: ${userQuery} The image should be a professional product photo.`,
    `A sticker inspired by the user query: ${userQuery} The image should be a professional product photo.`,
    `A coffee cup inspired by the user query: ${userQuery} The image should be a professional product photo.`
  ]
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)]
  const imageUrl = await aigen.generateImage(randomPrompt, {
    width: 768,
    height: 1024,
    model: 'gpt-image-1@openai'
  })
  return imageUrl
}

// Function to generate 3 random images
async function generateRandomProductImages(userQuery) {
  const images = await Promise.all(
    Array.from({ length: 3 }, async () => await generateRandomProductImage(userQuery))
  )
  return images
}

//use the function to generate 3 random images (creating the image URLs doesn't take any credits and is almost instant)
const images = await generateRandomProductImages('minecraft grapes')

//On the other hand, if you open one of the images in your browser, it will take the credits to generate the image
console.log(images)
