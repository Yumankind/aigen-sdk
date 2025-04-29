// Example of generating custom emails with Aigen
// This example uses the Aigen SDK to generate the hero image to include in a html email

// Import required modules
import AigenSDK from 'aigen-sdk'
import nodemailer from 'nodemailer'

//Get your secret from your AI Gen account (https://aigen.run) - "My Secret Keys" on the top right corner
//If you don't have an account, you can sign up for free (no credit card required) and get free credits to start
const AIGEN_SECRET = 'AaA/BbB/CcC'

// Initialize Aigen SDK with your secret
const aigen = new AigenSDK(AIGEN_SECRET)

// Generate the hero image
const heroImage = await aigen.generateImage(
  'Write "Hello $$profile.name$$ " in cursive on the top half with beautiful round lettering. On the bottom half, make the user look up to its name. The background should be white',
  {
    width: 1200,
    height: 600,
    model: 'gpt-image-1@openai',
    profile: 'instagram:youfoundbruno'
  }
)

// Print the hero image URL
console.log('Hero Image URL:', heroImage)

const htmlEmail = `
<html>
  <head>
    <title>Custom Email</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 20px;
        font-family: Arial, sans-serif;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <img src="${heroImage}" alt="Hero Image">
          </td>
        </tr>
        <tr>
          <td style="padding: 16px;">
            <p>Greetings!</p>
            <p>We're excited to announce that you've been selected to receive a special offer on your next purchase. As a valued customer, we're offering you a 20% discount on your next order.</p>
            <p>To take advantage of this exclusive offer, simply use the code "VALUEDCUSTOMER" at checkout.</p>
            <p>Don't miss out on this limited-time opportunity - shop now and save big!</p>
            <p>Best regards,</p>
            <p>The AI Gen Team</p>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`

// Print the HTML email
console.log('HTML Email:', htmlEmail)

// Send the email with a popular email service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password'
  }
})

transporter.sendMail(
  {
    from: 'your-email@gmail.com',
    to: 'recipient-email@example.com',
    subject: 'Custom Email',
    html: htmlEmail
  },
  (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  }
)
