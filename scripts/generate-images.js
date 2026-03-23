#!/usr/bin/env node
/**
 * Peach 2026 — Batch Image Generation Script
 * Uses LiteLLM → Gemini Image Pro to generate all storybook illustrations
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'https://litellm.vllm.yesy.dev/v1/chat/completions';
const API_KEY = 'sk-NQ4xhpib6BTFjlwuNhFPWQ';
const MODEL = 'gemini-3-pro-image-preview';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');

// Character reference image (base64)
const CHAR_REF_PATH = path.join(__dirname, '..', 'docs', 'characters-reference.jpg');

// Style DNA suffix for ALL prompts
const STYLE_DNA = `Style: Flat 2D children's illustration inspired by Bluey (Ludo Studio) art direction. Shape language dominated by circles and rounded rectangles — no sharp angles or triangles. All proportions are miniaturized and chunky, like dollhouse toys. Linework is never black; outlines match a darker, more saturated version of the object's local color. Lighting is warm and golden, evoking late-afternoon subtropical sun. All shadows carry color bias — blue objects cast purple shadows, orange objects cast warm brown shadows, never neutral gray. Background treatment is flat and graphic with minimal perspective, using 2-3 layered color planes to suggest depth. Surface texture has subtle watercolor paper grain, not smooth vector. Color palette centers on warm orange (#E27A37), sky blue (#88CAFC), cream (#E4DCBD), golden yellow (#EDCC6F), with soft lavender and mint as supporting tones. Deep indigo (#404066) for text and dark accents. Overall mood: warm, cozy, playful, safe. Landscape 16:9 format, 2048x1152 resolution.`;

// Character descriptions for consistency
const DOUBAO_DESC = 'a cute cartoon girl with brown bob-cut hair, wearing a dark jacket with a bright red scarf, warm smile, chunky proportions';
const AUSTIN_DESC = 'a cute cartoon boy with short black hair, wearing a red cable-knit sweater, cheerful excited expression, chunky proportions';

// All 36 slides with their image prompts
const SLIDES = [
  // Chapter 1: Meet New Friends
  { id: 'cover', scene: `${AUSTIN_DESC} and ${DOUBAO_DESC} standing together in a magical classroom, surrounded by floating stars, musical notes, and colorful bubbles. A rainbow arcs above them. Leave space at top for title text. The boy points forward excitedly, the girl smiles warmly.`, hasCharacters: true },
  { id: 'ch1-friends', scene: `Four diverse cute cartoon preschool children holding hands in a circle on a sunny grass field with daisies. Warm afternoon light, blue sky with fluffy clouds.`, hasCharacters: false },
  { id: 'ch1-meet-doubao', scene: `${DOUBAO_DESC} making a grand entrance from behind sparkly curtains, waving hello with both hands. Stars and sparkles surround her. Background is a cozy preschool classroom with round tables and colorful chairs.`, hasCharacters: true },
  { id: 'ch1-tablet', scene: `${DOUBAO_DESC} popping out of a large tablet screen like magic, surrounded by glowing lightbulbs and spinning gears. ${AUSTIN_DESC} stands next to the tablet looking amazed with mouth open. The tablet sits on a round wooden table.`, hasCharacters: true },
  { id: 'ch1-wrong', scene: `${DOUBAO_DESC} scratching her head with a confused cute expression, question marks floating around her head. ${AUSTIN_DESC} giggling beside her. Warm classroom background.`, hasCharacters: true },

  // Chapter 2: Curiosity Explosion
  { id: 'ch2-title', scene: `${AUSTIN_DESC} raising his hand high with excitement, surrounded by colorful floating question mark bubbles of different sizes. Background is warm and bright with light rays.`, hasCharacters: true },
  { id: 'ch2-dinosaur', scene: `A super cute chunky green T-Rex dinosaur munching on leafy plants, surrounded by ferns and prehistoric trees. A smaller blue herbivore dinosaur peeks from behind a rock. Warm jungle setting with golden light filtering through.`, hasCharacters: false },
  { id: 'ch2-rain', scene: `Adorable smiling cloud characters gently raining droplets on happy flowers below who are holding tiny colorful umbrellas. Water cycle shown in a cute simple way with arrows showing water going up as steam from a pond. Sunny and rainy at the same time with a rainbow.`, hasCharacters: false },
  { id: 'ch2-moon', scene: `A magical nighttime scene: a glowing crescent moon with a cute face, and a silhouette of Chang'e (Chinese moon goddess) with a jade rabbit sitting on the moon surface. Stars twinkle around. Deep blue-purple sky with warm golden moon glow.`, hasCharacters: false },
  { id: 'ch2-your-turn', scene: `${AUSTIN_DESC} standing confidently with hand raised, looking at ${DOUBAO_DESC} who has her hand cupped to her ear in a listening pose. Speech bubbles with question marks float between them. Bright energetic background.`, hasCharacters: true },
  { id: 'ch2-more-questions', scene: `A grid of cute illustrated icons: a penguin waddling, an ice cream cone, a sleeping fish with a pillow, a tiny ant carrying a huge leaf, a hand with 5 fingers glowing. Each icon in its own soft-colored rounded rectangle. Light cream background.`, hasCharacters: false },

  // Chapter 3: Story Time
  { id: 'ch3-title', scene: `${DOUBAO_DESC} and ${AUSTIN_DESC} sitting on top of a giant open storybook, legs dangling. The book pages show an enchanted forest illustration. Story sparkles and letters float up from the pages. Warm library-like background.`, hasCharacters: true },
  { id: 'ch3-rabbit', scene: `A cute white rabbit with a tiny red backpack hopping along a winding forest path. The path is lined with magical glowing mushrooms and wildflowers. Dappled golden sunlight through the trees. Enchanted forest atmosphere.`, hasCharacters: false },
  { id: 'ch3-glow', scene: `The same cute white rabbit from the forest, stopping and looking surprised at a mysterious golden glow emanating from behind a bush. Light rays and sparkles coming from the hidden object. A giant question mark floats above the rabbit's head.`, hasCharacters: false },
  { id: 'ch3-storytelling', scene: `${DOUBAO_DESC} sitting in a cozy armchair, gesturing expressively while telling a story. Story bubbles float around her showing tiny scenes: a castle, a dragon, a treasure chest. ${AUSTIN_DESC} and two other children sit cross-legged on the floor, listening with wide eyes.`, hasCharacters: true },
  { id: 'ch3-more-stories', scene: `Three story starter cards floating in the air like playing cards: 1) a lost kitten in a mysterious place, 2) a star falling from the night sky, 3) a talking present box with a bow. Each card has a cute illustration. Sparkly magical background.`, hasCharacters: false },

  // Chapter 4: Drawing
  { id: 'ch4-title', scene: `${DOUBAO_DESC} holding a giant magical glowing paintbrush, standing in front of a huge blank canvas on an easel. Paint splatters of bright colors float in the air. ${AUSTIN_DESC} watches excitedly from the side. Art studio background with warm lighting.`, hasCharacters: true },
  { id: 'ch4-simple-cat', scene: `A very simple, plain, basic cartoon cat sitting alone on white background. Just a basic orange cat with minimal details. Deliberately boring and plain-looking to show contrast with the next detailed version.`, hasCharacters: false },
  { id: 'ch4-fancy-cat', scene: `An amazingly detailed and beautiful orange tabby kitten wearing a sparkly blue wizard hat, sitting on top of a giant red-spotted mushroom in an enchanted forest. Colorful butterflies flutter around. Magical sparkles everywhere. Rich colors and details.`, hasCharacters: false },
  { id: 'ch4-compare', scene: `Split screen comparison: LEFT side shows a simple plain cat (boring), RIGHT side shows the same magical cat on mushroom with wizard hat (amazing). A big sparkly arrow points from left to right. Text area at bottom for the teaching point.`, hasCharacters: false },
  { id: 'ch4-your-turn', scene: `${AUSTIN_DESC} excitedly pointing at a large glowing blank canvas/frame that shimmers with invitation. His expression is bursting with ideas. Paintbrushes and color palettes float around him.`, hasCharacters: true },
  { id: 'ch4-framework', scene: `Three large round icons in a row: 1) a paint palette icon (representing COLOR), 2) a running stick figure icon (representing ACTION), 3) a map pin/location icon (representing PLACE). Each icon is in a brightly colored circle. Clean, instructional layout.`, hasCharacters: false },
  { id: 'ch4-gallery', scene: `A 2x2 gallery of amazing cute illustrations: top-left: a penguin with a red scarf looking at stars from an iceberg, top-right: a flying elephant with a frog on its back crossing a rainbow, bottom-left: a candy house with chocolate roof and lollipop door, bottom-right: a dinosaur in a pink apron baking a cake in a kitchen. Each in a rounded frame.`, hasCharacters: false },

  // Chapter 5: Dream Director
  { id: 'ch5-title', scene: `${DOUBAO_DESC} and ${AUSTIN_DESC} wearing tiny director berets, ${AUSTIN_DESC} holding a movie clapperboard. Behind them is a magical movie screen showing an animated scene coming to life - characters jumping out of the screen. Film reels and stars float around. Cinema/stage setting.`, hasCharacters: true },
  { id: 'ch5-fish', scene: `Split scene: LEFT side shows a normal fish swimming in water (ordinary). RIGHT side shows the SAME fish flying high above clouds in the sky with tiny wings, looking amazed and joyful. A big magical sparkle arrow between the two scenes. "Impossible becomes possible" feeling.`, hasCharacters: false },
  { id: 'ch5-cat-car', scene: `Split scene: LEFT side shows a regular cat walking on the ground (ordinary). RIGHT side shows a cool cat wearing sunglasses, driving a tiny red convertible car through a sunny city street, wind blowing its fur. Magical transition between the two.`, hasCharacters: false },
  { id: 'ch5-dino-class', scene: `Split scene: LEFT side shows a dinosaur skeleton/fossil in a museum (ordinary). RIGHT side shows a cute green dinosaur walking into a colorful preschool classroom, waving at tiny desks and chairs, children's drawings on the walls. The dinosaur looks friendly and curious.`, hasCharacters: false },
  { id: 'ch5-demo', scene: `A cute green cartoon dinosaur wearing a red backpack, walking through the front gate of a colorful kindergarten/preschool. Cherry blossom trees line the path. The dinosaur waves happily. A video play button overlay in the corner suggests this could be animated. Warm morning light.`, hasCharacters: false },
  { id: 'ch5-your-turn', scene: `${AUSTIN_DESC} dressed as a little movie director with a beret hat, sitting in a tiny director's chair and holding up a clapperboard. ${DOUBAO_DESC} stands ready with a magic wand. Background is a mini movie set with spotlights.`, hasCharacters: true },
  { id: 'ch5-ideas', scene: `Five fun concept cards floating in a circle: 1) penguin eating ice cream in a desert, 2) elephant doing a cannonball into a swimming pool, 3) snowman pushing a shopping cart in a supermarket, 4) a toothbrush singing and dancing in a bathroom, 5) a backpack opening and butterflies flying out. Each card is vibrant and playful.`, hasCharacters: false },

  // Chapter 6: Four Promises
  { id: 'ch6-title', scene: `${DOUBAO_DESC} and ${AUSTIN_DESC} doing a pinky promise, their pinkies linked together. Hearts and stars float around their joined hands. Warm golden background with soft light. Both have sincere, sweet expressions.`, hasCharacters: true },
  { id: 'ch6-dream', scene: `A dreamy bubble floating in the air containing magical impossible scenes (flying fish, cat driving car). Outside the bubble, reality is normal. A small "this is a dream" sign with a friendly warning symbol. Soft ethereal colors for the dream bubble, warm real colors outside.`, hasCharacters: false },
  { id: 'ch6-family', scene: `A warm family scene: a father, mother, and ${AUSTIN_DESC} sitting together on a cozy couch, all looking at a tablet together. The room is warm and bright with family photos on the wall, a plant, and soft lighting. Everyone is smiling and engaged.`, hasCharacters: true },
  { id: 'ch6-check', scene: `${DOUBAO_DESC} with a confused expression and question marks above her head. Next to her, a kind-looking parent figure (mom or dad) is smiling and holding up a finger as if explaining something. A speech bubble with a checkmark shows the correct answer. Warm domestic background.`, hasCharacters: true },
  { id: 'ch6-rest', scene: `Happy cartoon children running and playing outdoors on a green hill with sunshine. One child is doing a cartwheel, another chasing butterflies, another lying on the grass looking at clouds. Blue sky, green grass, daisies, warm afternoon light. Pure outdoor joy.`, hasCharacters: false },

  // Ending
  { id: 'ending', scene: `${DOUBAO_DESC} and ${AUSTIN_DESC} waving goodbye warmly, surrounded by rising colorful balloons, floating stars, and confetti. They stand in front of a sunset sky with warm orange and pink hues. Both have big happy smiles. Farewell feeling but warm and hopeful.`, hasCharacters: true },
];

// Rate limiting
const DELAY_MS = 3000; // 3 seconds between requests

async function generateImage(slide) {
  const messages = [];
  
  // If slide has characters, include the reference image
  if (slide.hasCharacters) {
    const refImage = fs.readFileSync(CHAR_REF_PATH);
    const refB64 = refImage.toString('base64');
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${refB64}` }
        },
        {
          type: 'text',
          text: `Using the two characters in this reference image as visual guide (left girl = "Doubao", right boy = "Austin"), generate the following scene:\n\n${slide.scene}\n\n${STYLE_DNA}`
        }
      ]
    });
  } else {
    messages.push({
      role: 'user',
      content: `Generate this illustration:\n\n${slide.scene}\n\n${STYLE_DNA}`
    });
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 4096
    })
  });

  const data = await response.json();
  
  if (data.choices && data.choices[0]?.message?.images) {
    const images = data.choices[0].message.images;
    if (images.length > 0) {
      const url = images[0].image_url.url;
      if (url.startsWith('data:')) {
        const b64 = url.split(',')[1];
        const buffer = Buffer.from(b64, 'base64');
        const outPath = path.join(OUTPUT_DIR, `${slide.id}.png`);
        fs.writeFileSync(outPath, buffer);
        console.log(`✅ ${slide.id}.png saved (${(buffer.length / 1024).toFixed(0)}KB)`);
        return true;
      }
    }
  }
  
  // Try alternative response format
  if (data.choices && data.choices[0]?.message?.content) {
    const content = data.choices[0].message.content;
    if (Array.isArray(content)) {
      for (const part of content) {
        if (part.type === 'image_url' && part.image_url?.url?.startsWith('data:')) {
          const b64 = part.image_url.url.split(',')[1];
          const buffer = Buffer.from(b64, 'base64');
          const outPath = path.join(OUTPUT_DIR, `${slide.id}.png`);
          fs.writeFileSync(outPath, buffer);
          console.log(`✅ ${slide.id}.png saved (${(buffer.length / 1024).toFixed(0)}KB)`);
          return true;
        }
      }
    }
  }
  
  console.error(`❌ ${slide.id}: Failed to generate`, JSON.stringify(data).slice(0, 300));
  return false;
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Check which images already exist
  const existing = new Set(
    fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.png'))
      .map(f => f.replace('.png', ''))
  );
  
  const toGenerate = SLIDES.filter(s => !existing.has(s.id));
  
  console.log(`\n🎨 Peach 2026 Image Generation`);
  console.log(`Total slides: ${SLIDES.length}`);
  console.log(`Already generated: ${existing.size}`);
  console.log(`To generate: ${toGenerate.length}\n`);
  
  let success = 0;
  let fail = 0;
  
  for (let i = 0; i < toGenerate.length; i++) {
    const slide = toGenerate[i];
    console.log(`[${i + 1}/${toGenerate.length}] Generating ${slide.id}...`);
    
    try {
      const ok = await generateImage(slide);
      if (ok) success++;
      else fail++;
    } catch (err) {
      console.error(`❌ ${slide.id}: Error - ${err.message}`);
      fail++;
    }
    
    // Rate limit delay
    if (i < toGenerate.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }
  
  console.log(`\n📊 Results: ${success} success, ${fail} failed out of ${toGenerate.length}`);
}

main().catch(console.error);
