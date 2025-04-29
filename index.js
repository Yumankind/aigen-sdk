#!/usr/bin/env node
const https = require('https')
const crypto = require('crypto')
const pako = require('pako')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

class AigenSDK {
  constructor(secret) {
    this.secret = secret
    this.baseUrl = 'https://aigen.run'
  }

  async createSignature(path, timestamp, queryParams) {
    try {
      
      // Get the current user ID
      const keyId = this.secret.split('/')[0]
      if (!keyId) {
        throw new Error('Invalid secret format')
      }

      //use the first secret from the secrets array
      const secretValue = this.secret.split('/')[2]
      if (!secretValue) {
        throw new Error('Invalid secret format')
      }

      let version = null

      if (queryParams && Object.keys(queryParams).length > 0) {
        //order them alphabetically to create a version hash
        const sortedQueryParams = Object.keys(queryParams)
          .sort()
          .reduce((obj, key) => {
            obj[key] = encodeURI(queryParams[key])
            return obj
          }, {})
        const queryParamsString = JSON.stringify(sortedQueryParams)
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(queryParamsString));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        version = hashHex.slice(0, 8)
        queryParams = sortedQueryParams
      }

      // Create HMAC signature
      const encoder = new TextEncoder()
      const data = encoder.encode(path + timestamp + (version ? '_' + version : ''))
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretValue),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, data)
      const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')

      // Format as keyId:signature
      return `${keyId}:${base64Signature}:${timestamp}`
    } catch (error) {
      console.error('Signature creation failed:', error)
      return null
    }
  }

  /**
   * Generate an image from a prompt
   * @param {string} prompt - The prompt to generate an image from
   * @param {Object} options - Optional parameters
   * @param {number} options.width - Image width (default: 768)
   * @param {number} options.height - Image height (default: 768)
   * @param {string} options.model - Model to use (default: stability-ai/sdxl)
   * Available models:
      * flux-dev-lora@black-forest-labs
      * flux-1.1-pro-ultra@black-forest-labs
      * flux-1.1-pro@black-forest-labs
      * recraft-v3@recraft-ai
      * flux-schnell@black-forest-labs
      * sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe@bytedance
      * imagen-3.0-generate-002@google
      * imagen-3.0-capability-001@google
      * gemini-2.0-flash-exp-image-generation@google
      * imagen-3@google
      * imagen-3-fast@google
      * sana:c6b5d2b7459910fec94432e9e1203c3cdce92d6db20f714f1355747990b52fa6@nvidia
      * stable-diffusion-3.5-medium@stability-ai
      * stable-diffusion-3.5-large-turbo@stability-ai
      * stable-diffusion-3.5-large@stability-ai
      * sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc@stability-ai
      * gpt-image-1@openai
   *  @param {string} options.original - Original image to use as a base for the generation
   *  @param {string} options.profile - Profile image to use as a base for the generation in the formats:
   *    - facebook:username
   *    - instagram:username
   *    - linkedin:username
   *  (more social networks comming soon)
   * @returns {Promise<string>} - URL to the generated image
   */
  async generateImage(prompt, options = {}) {
    if (!prompt || prompt.length === 0) {
      throw new Error('Prompt with instructions is required')
    }
    const width = options.width || 768
    const height = options.height || 768
    const model = options.model || null
    const original = options.original || null
    const profile = options.profile || null
    const duration = options.duration || 24 //in hours

    const userId = this.secret.split('/')[1]
    let encoded = null

    let typePrefix = 'img'
    let sizePrefix = `${width}x${height}`
    if (model && model.includes('/')) {
      let modelParts = model.split('/')
      sizePrefix += `/${modelParts[1] + '@' + modelParts[0]}`
    } else if(model && model.includes('@')) {
      sizePrefix += `/${model}`
    } else {
      sizePrefix += `/flux-schnell@black-forest-labs`
    }

    if (profile) {
      let profileParts = profile.split(':')
      let socialNetwork = profileParts[0]
      //only facebook, instagram and linkedin are supported for now
      if (socialNetwork != 'facebook' && socialNetwork != 'instagram' && socialNetwork != 'linkedin') {
        throw new Error('Invalid profile format, use one of the following: facebook:username, instagram:username, linkedin:username')
      }
    }

    if (prompt.length > 2000) {
      //TODO: compress instructions
      encoded = encodeURIComponent(prompt)
    } else {
      encoded = encodeURIComponent(prompt)
    }
    let queryParams = null
    if (original) {
      queryParams = { original: original }
    }
    if (profile) {
      queryParams = { ...queryParams, profile: profile }
    }
    //create signature
    const path = `${typePrefix}/${userId}/${sizePrefix}/${encoded}.png`
    const timestamp = new Date().getTime()
    //add 24 hours to the timestamp
    const timestamp24Hours = timestamp + 1000 * 60 * 60 * duration

    const signature = await this.createSignature(path, timestamp24Hours, queryParams)

    //add query params to the url
    if (queryParams && Object.keys(queryParams).length > 0) {
      const queryParamsString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
      return `${this.baseUrl}/${path}?sig=${signature}&${queryParamsString}`
    } else {
      return `${this.baseUrl}/${path}?sig=${signature}`
    }
  }

  /**
   * Delete an image or unpublish a page
   * @param {string} publicUrl - The public URL of the image or page
   * @param {boolean} unpublish - Whether to unpublish the page (default: false)
   * @returns {Promise<string>} - URL to the delete or unpublish command
   */
  async removeContent(publicUrl, unpublish = false) {
    // Extract the encoded part from the URL
    const url = new URL(publicUrl)
    const pathParts = url.pathname.split('/')
    const key = pathParts[pathParts.length - 1]

    //the secret is divided into userId, keyId and secret
    const userId = this.secret.split(':')[0]
    const keyId = this.secret.split(':')[1]
    const secret = this.secret.split(':')[2]

    // Create JWT signature with user ID and key
    const payload = {
      userId: userId,
      keyId: keyId,
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from now
    }
    const token = jwt.sign(payload, secret)

    // Construct the delete URL with signature
    return `${this.baseUrl}/${unpublish ? 'unpublish' : 'delete'}/${key}?sig=${token}`
  }
}

// CLI functionality
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]

  //aigen publish "<prompt>" - publish a page to the web

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
    AigenSDK - Generate AI images and pages via URL with worldwide CDN cache and hosting
    
    Usage:
      aigen generate "<prompt>" [options] - generate an AI image
      aigen save-secret - save the secret in the current directory for future use
      aigen delete "<public_url>" - delete an image from the server

    Options:
      --width=<width>     Image width (default: 768)
      --height=<height>   Image height (default: 768)
      --model=<model>     Model to use (default: flux-schnell@black-forest-labs)
      --secret=<secret>   Your secret key for signing URLs (required)
      --original=<url>    Original image to use as a base for the generation
      --save-secret       Save the secret to .aigen-secret file in the current directory
      
    Example:
      aigen generate "a beautiful sunset over the ocean" --width=1024 --height=768 --secret=your_secret_key --save-secret

    📖 Go to https://aigen.run/#/developers for more information
    `)
    process.exit(0)
  }

  // Handle save-secret command
  if (command === 'save-secret') {
    const secretArg = args.find(arg => arg.startsWith('--secret='))
    let secret = secretArg ? secretArg.split('=')[1] : process.env.AIGEN_SECRET

    if (!secret) {
      console.error(
        'Error: Secret key is required. Provide it with --secret=<secretKey> or set AIGEN_SECRET environment variable.'
      )
      process.exit(1)
    }

    // Check if secret has 3 parts
    const secretParts = secret.split('/')
    if (secretParts.length !== 3) {
      console.error('Error: Invalid secret format.')
      process.exit(1)
    }

    // Save secret to file
    const secretFilePath = path.join(process.cwd(), '.aigen-secret')
    try {
      fs.writeFileSync(secretFilePath, secret, 'utf8')
      console.log(`Secret saved to ${secretFilePath}`)

      // Add to .gitignore if it exists and doesn't already contain the entry
      const gitignorePath = path.join(process.cwd(), '.gitignore')
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
        if (!gitignoreContent.split('\n').some(line => line.trim() === '.aigen-secret')) {
          fs.appendFileSync(gitignorePath, '\n# AigenSDK secret\n.aigen-secret\n')
          console.log('Added .aigen-secret to .gitignore')
        }
      } else {
        fs.writeFileSync(gitignorePath, '# AigenSDK secret\n.aigen-secret\n')
        console.log('Created .gitignore with .aigen-secret entry')
      }
      process.exit(0)
    } catch (error) {
      console.error('Error: Could not save secret to file:', error.message)
      process.exit(1)
    }
  }

  // Handle delete command
  if (command === 'delete') {
    const publicUrl = args[1]
    if (!publicUrl) {
      console.error('Error: Public URL is required.')
      process.exit(1)
    }

    const aigen = new AigenSDK(secret)
    aigen
      .removeContent(publicUrl, false)
      .then(deleteUrl => {
        //call the delete url to actually delete the image
        https.get(deleteUrl, res => {
          if (res.statusCode === 200) {
            console.log('Image deleted successfully.')
          } else {
            console.error('Error:', res.statusCode)
          }
          process.exit(0)
        })
      })
      .catch(error => {
        console.error('Error:', error.message)
        process.exit(1)
      })
  }

  // Handle unpublish command
  if (command === 'unpublish') {
    const publicUrl = args[1]
    if (!publicUrl) {
      console.error('Error: Public URL is required.')
      process.exit(1)
    }

    const aigen = new AigenSDK(secret)
    aigen
      .removeContent(publicUrl, true)
      .then(unpublishUrl => {
        //call the unpublish url to actually delete the page
        https.get(unpublishUrl, res => {
          if (res.statusCode === 200) {
            console.log('Page unpublished successfully.')
          } else {
            console.error('Error:', res.statusCode)
          }
          process.exit(0)
        })
      })
      .catch(error => {
        console.error('Error:', error.message)
        process.exit(1)
      })
  }

  // Handle generate and publish commands
  let prompt
  if (command === 'generate' || command === 'publish') {
    // Find the index of the first argument that starts with '--'
    const optionIndex = args.slice(1).findIndex(arg => arg.startsWith('--'));
    // If found, take everything before it, otherwise take all arguments after command
    prompt = optionIndex !== -1 
      ? args.slice(1, optionIndex + 1).join(' ') 
      : args.slice(1).join(' ');
  } else {
    // If no command is specified, assume the first arg is the prompt for generate
    const optionIndex = args.findIndex(arg => arg.startsWith('--'));
    prompt = optionIndex !== -1 
      ? args.slice(0, optionIndex).join(' ') 
      : args.join(' ');
    command = 'generate';
  }

  if (!prompt) {
    console.error('Error: Prompt with instructions is required.')
    process.exit(1)
  }

  const options = {}
  let secret
  let saveSecret = false

  // Parse options
  args.slice(command === 'generate' || command === 'publish' ? 2 : 1).forEach(arg => {
    if (arg.startsWith('--width=')) {
      options.width = parseInt(arg.split('=')[1])
    } else if (arg.startsWith('--height=')) {
      options.height = parseInt(arg.split('=')[1])
    } else if (arg.startsWith('--model=')) {
      options.model = arg.split('=')[1]
    } else if (arg.startsWith('--original=')) {
      options.original = arg.split('=')[1]
    } else if (arg.startsWith('--secret=')) {
      secret = arg.split('=')[1]
    } else if (arg === '--save-secret') {
      saveSecret = true
    } else if (arg.startsWith('--duration=')) {
      options.duration = parseInt(arg.split('=')[1])
    } else if (arg.startsWith('--profile=')) {
      options.profile = arg.split('=')[1]
    }
  })

  // Try to load secret from .aigen-secret file if it exists
  const secretFilePath = path.join(process.cwd(), '.aigen-secret')
  if (!secret && fs.existsSync(secretFilePath)) {
    try {
      secret = fs.readFileSync(secretFilePath, 'utf8').trim()
    } catch (error) {
      console.warn('Warning: Could not read secret from .aigen-secret file:', error.message)
    }
  }

  // Check for secret in environment or arguments
  secret = secret || process.env.AIGEN_SECRET

  if (!secret) {
    console.error(
      'Error: Secret key is required. Provide it with --secret=<secretKey>, set AIGEN_SECRET environment variable, or use --save-secret to save it for future use.'
    )
    process.exit(1)
  }

  // Check if secret has 3 parts (should be in format userId:keyId:secretValue)
  const secretParts = secret.split('/')
  if (secretParts.length !== 3) {
    console.error('Error: Invalid secret format.')
    process.exit(1)
  }

  // Save secret to file if requested
  if (saveSecret && secret) {
    try {
      fs.writeFileSync(secretFilePath, secret, 'utf8')
      console.log(`Secret saved to ${secretFilePath}`)

      // Add to .gitignore if it exists and doesn't already contain the entry
      const gitignorePath = path.join(process.cwd(), '.gitignore')
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
        if (!gitignoreContent.split('\n').some(line => line.trim() === '.aigen-secret')) {
          fs.appendFileSync(gitignorePath, '\n# AigenSDK secret\n.aigen-secret\n')
          console.log('Added .aigen-secret to .gitignore')
        }
      } else {
        fs.writeFileSync(gitignorePath, '# AigenSDK secret\n.aigen-secret\n')
        console.log('Created .gitignore with .aigen-secret entry')
      }
    } catch (error) {
      console.warn('Warning: Could not save secret to file:', error.message)
    }
  }

  const aigen = new AigenSDK(secret)

  if (command === 'generate') {
    aigen
      .generateImage(prompt, options)
      .then(url => {
        console.log(`Pre-signed generative URL: ${url}`)
      })
      .catch(error => {
        console.error('Error:', error.message)
        process.exit(1)
      })
  } else if (command === 'publish') {
    // Encode the prompt to generate a URL for web pages
    const compressedPrompt = pako.deflate(prompt)
    const base64 = Buffer.from(compressedPrompt)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    // Create JWT signature with user ID and key
    const userId = secret.split(':')[0]
    const keyId = secret.split(':')[1]
    const secretKey = secret.split(':')[2]
    const payload = {
      userId: userId,
      keyId: keyId,
      expiresAt: Math.floor(Date.now() / 1000) + 60 * 5 // 5 minutes from now
    }
    const token = jwt.sign(payload, secretKey)

    // Construct the web page URL with signature
    const url = `${aigen.baseUrl}/w/${base64}?sig=${token}`
    console.log(`Page published: ${url}`)
  }
} else {
  // Export for use as a module
  module.exports = AigenSDK
}
