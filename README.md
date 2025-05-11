# AigenSDK

Generate AI images and pre-signed secure URLs easily with Node.js or from your terminal.
Built for speed, security, and scalability.

### GenAI Infrastructure as a Service
- Generate unlimited pre-signed image generation URLs without paying
- Pay only for results: you pay only for the images opened
- Simple pricing: pay for generation and monthly storage
- Unlimited bandwidth and distribution with worldwide CDN and cache

## 🚀 Quick Start

Run directly without installing:

```bash
npx aigen-sdk generate 'a beautiful sunset over the ocean'
```

Or install locally:

```bash
npm install aigen-sdk
```

### Get your API secrets and try our platform for Free 

Go to [https://aigen.run/](https://aigen.run/) and create your free account (no credit card needed). You will get free credits to try our infrastructure.

Then click on your avatar on the top right corner, select "My secret keys".

**⚠️ The SDK is meant to be run in a safe environment (in a server), not in the browser. The secret should not be shared with anyone. On the other hand, the generative URL you can safely share and place it anywere.**

## 🛠️ SDK Example

```javascript
import AigenSDK from 'aigen-sdk' //or: const AigenSDK = require('aigen-sdk')

const aigen = new AigenSDK('your-secret-key') //optionally you can set your secret to the AIGEN_SECRET environment variable

// Generate an image from a prompt
const url = await aigen.generateImage('a futuristic cityscape', {
  width: 1024,
  height: 768,
  model: 'gpt-image-1@openai', // using OpenAI's new GPT image generator
  profile: 'facebook:username' // fetch user's Facebook profile image
})

console.log('Generated URL:', url)

// Create an image from a template with variables
const templateUrl = await aigen.createImage({
  template: 'templateId/version',  // Format: templateId/version
  data: {
    name: 'John Doe',
    company: 'Acme Inc',
    role: 'CEO'
  }
})

console.log('Template URL:', templateUrl)
```

## 🖥️ CLI Commands

```bash
# Generate an image from a prompt
npx aigen-sdk generate 'prompt' [options]

# Create an image from a template
npx aigen-sdk template 'templateId/version' --data.name="John" --data.company="Acme" [options]
```

**Options for generate:**
- `--width=<width>` (default: 768)
- `--height=<height>` (default: 768)
- `--model=<model>` (default: flux-schnell@black-forest-labs)
- `--original=<url>` (optional base image)
- `--profile=<socialnetwork:username>` (optional profile picture)
- `--duration=<hours>` (default: 24)
- `--secret=<your_key>` (required if not saved)
- `--save-secret` (save secret for future use)

**Options for template:**
- `--data.<variable>=<value>` (set template variables)
- `--duration=<hours>` (default: 24)
- `--secret=<your_key>` (required if not saved)
- `--save-secret` (save secret for future use)

**Save your secret:**

```bash
npx aigen-sdk save-secret --secret=your-secret-key
```

**Example using someone's profile:**

```bash
npx aigen-sdk generate 'A heroic portrait' --profile=facebook:john.doe
```

Note: the prompt should always be wrapped in single quotes to avoid strange shell interpretations of characters.

## 🎨 Advanced Image Manipulation Examples

Here are some advanced image manipulation techniques using the powerful `gpt-image-1@openai` model:

### Make the background of an image transparent

```javascript
// Using original image reference with a prompt specifying transparency
const url = await aigen.generateImage('Remove the background and make it transparent. Keep the main subject crisp and clear with a perfect alpha mask.', {
  original: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg',
  model: 'gpt-image-1@openai'
});
```

CLI:
```bash
npx aigen-sdk generate 'Remove the background and make it transparent. Keep the main subject crisp and clear with a perfect alpha mask.' --original=https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg --model=gpt-image-1@openai
```

### Edit an existing image on the internet

```javascript
// Edit an image from the internet by providing its URL
const url = await aigen.generateImage('Change the color of the car to bright red and add mountains in the background. Maintain the original image quality and lighting.', {
  original: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg',
  model: 'gpt-image-1@openai'
});
```

CLI:
```bash
npx aigen-sdk generate 'Change the color of the car to bright red and add mountains in the background. Maintain the original image quality and lighting.' --original=https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg --model=gpt-image-1@openai
```

### Join images into new professional images

```javascript
// Create a composite image by describing how to combine elements
const url = await aigen.generateImage('Create a professional product advertisement by combining the product from the reference image with a clean white background. Add elegant text layout for product name and features. Make it look like a high-end commercial advertisement.', {
  original: 'https://images.pexels.com/photos/2517881/pexels-photo-2517881.jpeg',
  model: 'gpt-image-1@openai'
});
```

CLI:
```bash
npx aigen-sdk generate 'Create a professional product advertisement by combining the product from the reference image with a clean white background. Add elegant text layout for product name and features. Make it look like a high-end commercial advertisement.' --original=https://images.pexels.com/photos/2517881/pexels-photo-2517881.jpeg --model=gpt-image-1@openai
```

### Create translations of existing images

```javascript
// Translate text in an image to a different language
const url = await aigen.generateImage('Translate all text in this image to Spanish, maintaining the same layout, style, and visual elements. Preserve all graphical components and only replace the text content with accurate Spanish translations.', {
  original: 'https://venngage-wordpress.s3.amazonaws.com/uploads/2021/10/TalentLyft-6-Recruitment-Metrics-Infographic-with-Icons.png',
  model: 'gpt-image-1@openai'
});
```

CLI:
```bash
npx aigen-sdk generate 'Translate all text in this image to Spanish, maintaining the same layout, style, and visual elements. Preserve all graphical components and only replace the text content with accurate Spanish translations.' --original=https://venngage-wordpress.s3.amazonaws.com/uploads/2021/10/TalentLyft-6-Recruitment-Metrics-Infographic-with-Icons.png --model=gpt-image-1@openai
```

### Target an existing image to different markets

```javascript
// Asian market adaptation
const asianUrl = await aigen.generateImage('Recreate this advertisement with East Asian models that resemble the target audience in China and Japan. Keep the same product placement, overall style, and maintain the brand identity. Ensure cultural nuances are appropriate for an Asian market.', {
  original: 'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg',
  model: 'gpt-image-1@openai'
});

// African market adaptation
const africanUrl = await aigen.generateImage('Recreate this advertisement with African models that resemble the target audience in Nigeria and Kenya. Keep the same product placement, overall style, and maintain the brand identity. Ensure cultural nuances are appropriate for an African market.', {
  original: 'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg',
  model: 'gpt-image-1@openai'
});

// European market adaptation
const europeanUrl = await aigen.generateImage('Recreate this advertisement with European models that resemble the target audience in France and Germany. Keep the same product placement, overall style, and maintain the brand identity. Ensure cultural nuances are appropriate for a European market.', {
  original: 'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg',
  model: 'gpt-image-1@openai'
});

// American market adaptation
const americanUrl = await aigen.generateImage('Recreate this advertisement with North American models that resemble the target audience in the United States. Keep the same product placement, overall style, and maintain the brand identity. Ensure cultural nuances are appropriate for an American market.', {
  original: 'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg',
  model: 'gpt-image-1@openai'
});
```

CLI example for one market:
```bash
npx aigen-sdk generate 'Recreate this advertisement with East Asian models that resemble the target audience in China and Japan. Keep the same product placement, overall style, and maintain the brand identity. Ensure cultural nuances are appropriate for an Asian market.' --original=https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg --model=gpt-image-1@openai
```

## ✨ New Features
🎨 Now supports OpenAI's ChatGPT latest image model: **gpt-image-1@openai**

You can generate images using OpenAI's new GPT-powered image generation!


🖼️ Import profile pictures for personalized generations:

Use the --profile option (CLI) or profile (SDK) to fetch and use user profile images from:

- facebook:username
- instagram:username
- linkedin:username

(More networks coming soon!)

### ✨ Other Features

- 🖼️ Generate millions of image variations
- 🔒 Secure HMAC SHA-256 signed URLs
- ⚡ Global CDN delivery
- 📦 Easy GET API / Node.js SDK / CLI support

## 🧠 Available Models

You can specify a model using the `--model` option or in the SDK.

Some available models:

- `flux-dev-lora@black-forest-labs`
- `flux-1.1-pro-ultra@black-forest-labs`
- `flux-1.1-pro@black-forest-labs`
- `recraft-v3@recraft-ai`
- `flux-schnell@black-forest-labs`
- `sdxl-lightning-4step@bytedance`
- `imagen-3.0-generate-002@google`
- `imagen-3.0-capability-001@google`
- `gemini-2.0-flash-exp-image-generation@google`
- `imagen-3@google`
- `imagen-3-fast@google`
- `sana@nvidia`
- `stable-diffusion-3.5-medium@stability-ai`
- `stable-diffusion-3.5-large-turbo@stability-ai`
- `stable-diffusion-3.5-large@stability-ai`
- `sdxl@stability-ai`
- `gpt-image-1@openai` ← 🆕 ChatGPT's new image model!

✅ **Tip:**  
If no model is specified, the default is:

```
flux-schnell@black-forest-labs
```

## 👤 Available Profile Variables

When you import a **social profile** using the `--profile` option (CLI) or the `profile` field (SDK), you can dynamically insert user information into your prompts with special variables.

| Variable | Description | Available On |
|:---------|:-------------|:--------------|
| `$$profile.name$$` | Full name of the user | Facebook, Instagram, LinkedIn |
| `$$profile.username$$` | Username or handle | Facebook, Instagram, LinkedIn |
| `$$profile.bio$$` | User bio or description | Facebook, Instagram, LinkedIn |
| `$$profile.country$$` | Country of the user | LinkedIn only |
| `$$profile.location$$` | City or location of the user | LinkedIn only |

---

### Examples:

✉️ **Custom welcome email hero:**

```text
On the top half, write $$profile.name$$ in cursive, round letters.  
On the bottom half, generate a portrait of $$profile.name$$ looking up at their name.  
Use a clean white background and have them wearing our black branded hoodie.
```

🎈 **Birthday greeting card:**

```text
Create a colorful birthday card featuring $$profile.name$$ with balloons and confetti.  
Add the message "Happy Birthday $$profile.name$$!" in playful fonts.
```

🌍 **Location based images:**

```text
Create a background with the flag of $$profile.country$$ and have $$profile.name$$ proudly holding a product with the country's colors.
```

🖼️ **Bio-integrated custom artwork:**

```text
Design an artistic poster showcasing $$profile.name$$ with visual elements inspired by their bio: "$$profile.bio$$".
```

During generation, these placeholders will be automatically **replaced** with real user data.

✅ **Notes:**
- If a variable is missing (e.g., no location), it will be ignored automatically.
- More social networks and fields coming soon!

### 📚 More models coming soon!

## 🖼️ Template-Based Image Creation

The SDK supports creating images from pre-defined templates with variable data. This is perfect for:

- Creating multiple variations of the same design
- Personalizing images with different names, products, or data
- Automating image creation for marketing campaigns, certificates, or badges

### Using Templates in SDK

```javascript
const aigen = new AigenSDK('your-secret-key')

// Create an image from a template
const url = await aigen.createImage({
  template: 'abc123/2',  // Format: templateId/version (version is optional)
  data: {
    name: 'John Doe',
    title: 'Product Manager',
    company: 'Acme Inc',
    // Add any variables your template uses
  },
  duration: 48  // Optional: signature validity in hours (default: 24)
})

console.log('Template URL:', url)
```

### Using Templates in CLI

```bash
# Basic usage
npx aigen-sdk template 'abc123/2' --data.name="John Doe" --data.company="Acme Inc"

# With multiple variables
npx aigen-sdk template 'abc123/2' \
  --data.name="John Doe" \
  --data.title="Product Manager" \
  --data.company="Acme Inc" \
  --data.color="#FF5733"
```

### How to Create Templates

1. Visit [https://aigen.run/](https://aigen.run/)
2. Create an image template and design it as you want using our design interface
3. Save your template to get the template ID
4. Use the template ID in your code or CLI commands

Each template can have multiple versions. If no version is specified, the latest version is used.

## 📖 Learn More

- 📚 Full Docs: [https://aigen.run/#/developers](https://aigen.run/#/developers)

## 🛠️ Support and Bug Reports

If you encounter any issues, need help, or want to request a feature, we're here to support you!

- 📬 **Email support:** [support@aigen.run](mailto:support@aigen.run)
- 🐛 **Create an issue:** [GitHub Issues](https://github.com/Yumankind/aigen-sdk/issues)

We typically respond within 24 hours.  
Feel free to reach out — your feedback helps us improve!

## ❤️ Build creative magic, at scale — with [aigen.run](https://aigen.run)