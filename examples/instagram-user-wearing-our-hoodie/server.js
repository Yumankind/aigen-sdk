// Example of sending an instagram message with a personalized image using the user's instagram information

// Import required modules
import AigenSDK from 'aigen-sdk'
import open from 'open'

//Get your secret from your AI Gen account (https://aigen.run) - "My Secret Keys" on the top right corner
//If you don't have an account, you can sign up for free (no credit card required) and get free credits to start
const AIGEN_SECRET = 'AaA/BbB/CcC'

const originalHoddieImageUrl = 'https://ctl.s6img.com/society6/img/mAsM7oLfIfuzJAzoAyF05rhYoE0/h_700,w_700/hoodies/pullover/front/black/first/~artwork,bg_FFFFFFFF,fw_4200,fh_4200,iw_4200,ih_4200/s6-original-art-uploads/society6/uploads/misc/916f91fcdbe74b2ca1db06bf93e15c8b'

// Initialize Aigen SDK with your secret
const aigen = new AigenSDK(AIGEN_SECRET)

// Function to generate a personalized image
async function generatePersonalizedHoddieImage(instagramUsername) {
  // Generate a personalized image using the user's instagram information
  const imageUrl = await aigen.generateImage('Wear this hoodie. Professional photo studio lighting. No text.', {
    width: 1200,
    height: 600,
    model: 'gpt-image-1@openai',
    profile: `instagram:${instagramUsername}`,
    original: originalHoddieImageUrl
  })
  return imageUrl
}

// Function to run the example
async function runExample(instagramUsername) {
  // Send a message to the user's instagram account
  const generatedImageUrl = await generatePersonalizedHoddieImage( instagramUsername)
  //open the image in the browser
  open(generatedImageUrl)
}

runExample('youfoundbruno')