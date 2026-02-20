// Runware.ai REST API Client — Workers-compatible (no SDK, no WebSocket)
// Used for product image background removal + lifestyle scene generation

const RUNWARE_API_URL = 'https://api.runware.ai/v1'

/**
 * Removes background from a product image using Runware.ai
 * Returns the URL of the bg-removed PNG, or null on failure.
 */
export async function removeBackground(imageUrl: string): Promise<string | null> {
  const apiKey = process.env.RUNWARE_API_KEY
  if (!apiKey) {
    console.log('Runware: RUNWARE_API_KEY not set, skipping background removal')
    return null
  }

  try {
    const taskUUID = crypto.randomUUID()

    const response = await fetch(RUNWARE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: 'authentication',
          apiKey,
        },
        {
          taskType: 'imageBackgroundRemoval',
          taskUUID,
          inputImage: imageUrl,
          outputType: 'URL',
          outputFormat: 'PNG',
          alphaMatting: true,
        },
      ]),
    })

    if (!response.ok) {
      console.error('Runware API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()

    // Runware returns an array of results; find the background removal result
    const result = data?.data?.find(
      (item: { taskType?: string; taskUUID?: string }) =>
        item.taskType === 'imageBackgroundRemoval' || item.taskUUID === taskUUID
    )

    if (!result?.imageURL) {
      console.error('Runware: No image URL in response', JSON.stringify(data))
      return null
    }

    return result.imageURL as string
  } catch (error) {
    console.error('Runware background removal error:', error)
    return null
  }
}

/**
 * Preprocesses an image using Canny edge detection to create an edge map.
 * Used as input for ControlNet-guided scene generation.
 */
export async function preprocessCanny(imageUrl: string): Promise<string | null> {
  const apiKey = process.env.RUNWARE_API_KEY
  if (!apiKey) {
    console.log('Runware: RUNWARE_API_KEY not set, skipping canny preprocessing')
    return null
  }

  try {
    const taskUUID = crypto.randomUUID()

    const response = await fetch(RUNWARE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { taskType: 'authentication', apiKey },
        {
          taskType: 'controlNetPreprocess',
          taskUUID,
          inputImage: imageUrl,
          preProcessorType: 'canny',
          outputType: 'URL',
          outputFormat: 'PNG',
          lowThresholdCanny: 100,
          highThresholdCanny: 200,
        },
      ]),
    })

    if (!response.ok) {
      console.error('Runware canny preprocess error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    const result = data?.data?.find(
      (item: { taskType?: string; taskUUID?: string }) =>
        item.taskType === 'controlNetPreprocess' || item.taskUUID === taskUUID
    )

    if (!result?.imageURL) {
      console.error('Runware: No canny edge map URL in response', JSON.stringify(data))
      return null
    }

    return result.imageURL as string
  } catch (error) {
    console.error('Runware canny preprocess error:', error)
    return null
  }
}

/**
 * Generates a scene image using FLUX Canny ControlNet.
 * Preserves product edges from the canny edge map while placing it in a new scene.
 */
export async function generateSceneWithCanny(
  cannyEdgeMapUrl: string,
  scenePrompt: string,
): Promise<string | null> {
  const apiKey = process.env.RUNWARE_API_KEY
  if (!apiKey) {
    console.log('Runware: RUNWARE_API_KEY not set, skipping canny scene generation')
    return null
  }

  try {
    const taskUUID = crypto.randomUUID()

    const response = await fetch(RUNWARE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        { taskType: 'authentication', apiKey },
        {
          taskType: 'imageInference',
          taskUUID,
          positivePrompt: scenePrompt,
          negativePrompt: 'blurry, low quality, distorted, watermark, text, cartoon, illustration, anime, deformed',
          seedImage: cannyEdgeMapUrl,
          model: 'runware:104@1', // FLUX Canny — preserves product edges
          width: 1024,
          height: 1024,
          numberResults: 1,
          outputType: 'URL',
          outputFormat: 'PNG',
          steps: 28,
          CFGScale: 7,
        },
      ]),
    })

    if (!response.ok) {
      console.error('Runware canny scene generation error:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    const result = data?.data?.find(
      (item: { taskType?: string; taskUUID?: string }) =>
        item.taskType === 'imageInference' || item.taskUUID === taskUUID
    )

    if (!result?.imageURL) {
      console.error('Runware: No canny scene image URL in response', JSON.stringify(data))
      return null
    }

    return result.imageURL as string
  } catch (error) {
    console.error('Runware canny scene generation error:', error)
    return null
  }
}

/**
 * Generates multiple scene images for a product using img2img with varied strengths.
 * Each scene uses a different strength for genuine visual variety:
 * - Scene 1 (hero): 0.50 — product clearly recognizable, new background
 * - Scene 2 (lifestyle): 0.62 — more creative, product in different context
 * - Scene 3 (creative): 0.72 — most artistic, dramatic reinterpretation
 */
export async function generateMultipleScenes(
  originalImageUrl: string,
  scenePrompts: string[],
): Promise<(string | null)[]> {
  const apiKey = process.env.RUNWARE_API_KEY
  if (!apiKey) {
    console.log('Runware: RUNWARE_API_KEY not set, skipping scene generation')
    return scenePrompts.map(() => null)
  }

  // Varied strengths produce genuinely different scenes
  const strengths = [0.50, 0.62, 0.72]

  const results = await Promise.all(
    scenePrompts.map((prompt, i) =>
      generateLifestyleScene(originalImageUrl, prompt, strengths[Math.min(i, strengths.length - 1)])
    )
  )
  return results
}

/**
 * Generates a professional studio background using pure text-to-image (no seed image).
 * The product is NOT included — only the background environment is generated.
 * Used for marketing images where the real product photo is composited on top.
 */
export async function generateStudioBackground(
  backgroundPrompt: string,
): Promise<string | null> {
  const apiKey = process.env.RUNWARE_API_KEY
  if (!apiKey) {
    console.log('Runware: RUNWARE_API_KEY not set, skipping studio background generation')
    return null
  }

  try {
    const taskUUID = crypto.randomUUID()

    const response = await fetch(RUNWARE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: 'authentication',
          apiKey,
        },
        {
          taskType: 'imageInference',
          taskUUID,
          positivePrompt: backgroundPrompt,
          negativePrompt: 'product, item, object in focus, hands, person, human, face, text, watermark, logo, label, packaging, bottle, box, blurry, low quality, distorted, cartoon, illustration, anime, painting, collage, split image, busy, cluttered',
          model: 'runware:101@1',
          width: 1024,
          height: 1024,
          numberResults: 1,
          outputType: 'URL',
          outputFormat: 'PNG',
          steps: 40,
          CFGScale: 9,
        },
      ]),
    })

    if (!response.ok) {
      console.error('Runware studio background API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()

    const result = data?.data?.find(
      (item: { taskType?: string; taskUUID?: string }) =>
        item.taskType === 'imageInference' || item.taskUUID === taskUUID
    )

    if (!result?.imageURL) {
      console.error('Runware: No studio background URL in response', JSON.stringify(data))
      return null
    }

    return result.imageURL as string
  } catch (error) {
    console.error('Runware studio background generation error:', error)
    return null
  }
}

/**
 * Generates a lifestyle scene for a product using Runware's image-to-image.
 * Takes the original product image and a scene prompt, returns a photorealistic
 * lifestyle scene URL with the product naturally placed in context.
 */
export async function generateLifestyleScene(
  imageUrl: string,
  scenePrompt: string,
  strength: number = 0.55,
): Promise<string | null> {
  const apiKey = process.env.RUNWARE_API_KEY
  if (!apiKey) {
    console.log('Runware: RUNWARE_API_KEY not set, skipping scene generation')
    return null
  }

  try {
    const taskUUID = crypto.randomUUID()

    const response = await fetch(RUNWARE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          taskType: 'authentication',
          apiKey,
        },
        {
          taskType: 'imageInference',
          taskUUID,
          positivePrompt: scenePrompt,
          negativePrompt: 'blurry, low quality, distorted, watermark, text overlay, collage, split image, cartoon, illustration, anime, painting',
          seedImage: imageUrl,
          strength,
          model: 'runware:101@1',
          width: 1024,
          height: 1024,
          numberResults: 1,
          outputType: 'URL',
          outputFormat: 'PNG',
          steps: 30,
          CFGScale: 7,
        },
      ]),
    })

    if (!response.ok) {
      console.error('Runware scene generation API error:', response.status, await response.text())
      return null
    }

    const data = await response.json()

    const result = data?.data?.find(
      (item: { taskType?: string; taskUUID?: string }) =>
        item.taskType === 'imageInference' || item.taskUUID === taskUUID
    )

    if (!result?.imageURL) {
      console.error('Runware: No scene image URL in response', JSON.stringify(data))
      return null
    }

    return result.imageURL as string
  } catch (error) {
    console.error('Runware scene generation error:', error)
    return null
  }
}
