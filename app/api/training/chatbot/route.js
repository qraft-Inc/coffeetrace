import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/dbConnect';
import TrainingContent from '@/models/TrainingContent';

/**
 * POST /api/training/chatbot
 * Simple chatbot for training Q&A
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { question, language = 'en' } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question required' }, { status: 400 });
    }

    // Simple keyword-based chatbot (can be enhanced with AI/ML)
    const keywords = extractKeywords(question.toLowerCase());
    
    // Search for relevant content
    const relevantContent = await TrainingContent.find({
      isPublished: true,
      $or: [
        { keywords: { $in: keywords } },
        { tags: { $in: keywords } },
        { [`title.${language}`]: { $regex: keywords.join('|'), $options: 'i' } },
      ],
    })
      .limit(5)
      .select('title slug category difficulty estimatedDuration')
      .lean();

    // Generate response based on keywords
    let response = generateResponse(keywords, language);

    // Add content suggestions
    if (relevantContent.length > 0) {
      response.suggestions = relevantContent.map(content => ({
        title: content.title.get(language) || content.title.get('en') || content.title.values().next().value,
        slug: content.slug,
        category: content.category,
        difficulty: content.difficulty,
        duration: content.estimatedDuration,
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing chatbot query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

/**
 * Extract keywords from question
 */
function extractKeywords(text) {
  const commonWords = ['how', 'what', 'when', 'where', 'why', 'can', 'should', 'do', 'does', 'is', 'are', 'the', 'a', 'an', 'to', 'of', 'for', 'in', 'on'];
  const words = text.toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 3 && !commonWords.includes(word));
}

/**
 * Generate response based on keywords and language
 */
function generateResponse(keywords, language) {
  const responses = {
    en: {
      pest: {
        answer: 'Coffee pests like the Coffee Berry Borer and Leaf Rust can significantly reduce yields. Integrated Pest Management (IPM) combines cultural, biological, and chemical methods. Regular monitoring, proper pruning, and maintaining farm hygiene are essential.',
        tips: [
          'Scout fields weekly for early detection',
          'Remove and destroy infected berries',
          'Use sticky traps to monitor pest populations',
          'Apply organic pesticides when necessary',
        ],
      },
      disease: {
        answer: 'Common coffee diseases include Coffee Leaf Rust (CLR), Coffee Berry Disease (CBD), and Coffee Wilt Disease (CWD). Prevention through resistant varieties, proper spacing, and good drainage is crucial.',
        tips: [
          'Plant disease-resistant varieties',
          'Maintain proper plant spacing for air circulation',
          'Remove infected plant material immediately',
          'Apply copper-based fungicides preventively',
        ],
      },
      harvest: {
        answer: 'Harvest coffee cherries when they are deep red and fully ripe. Selective picking ensures higher quality. Harvest in the morning when cherries are cool and avoid rainy days.',
        tips: [
          'Pick only ripe, red cherries',
          'Use baskets to avoid crushing berries',
          'Process within 24 hours of harvesting',
          'Train pickers on quality standards',
        ],
      },
      soil: {
        answer: 'Coffee thrives in well-drained, slightly acidic soil (pH 6-6.5) rich in organic matter. Regular soil testing helps determine nutrient needs.',
        tips: [
          'Test soil pH annually',
          'Add compost or manure regularly',
          'Use mulch to retain moisture',
          'Apply lime if soil is too acidic',
        ],
      },
      fertilizer: {
        answer: 'Coffee requires balanced NPK fertilization. Apply nitrogen in split doses during growing season, phosphorus at planting, and potassium before flowering.',
        tips: [
          'Apply NPK 15-15-15 or similar balanced fertilizer',
          'Split nitrogen applications into 3-4 doses',
          'Apply organic matter annually',
          'Use foliar sprays for micronutrients',
        ],
      },
      pruning: {
        answer: 'Prune coffee trees to maintain productivity and manage tree height. Remove dead wood, suckers, and excess branches to improve air circulation and light penetration.',
        tips: [
          'Prune after harvest season',
          'Remove vertical shoots (suckers)',
          'Thin out crowded branches',
          'Maintain tree height at 2-2.5 meters',
        ],
      },
      drying: {
        answer: 'Proper drying is crucial for quality. Dry coffee to 10-12% moisture content. Spread cherries/parchment evenly and turn regularly.',
        tips: [
          'Dry on raised beds or tarps',
          'Turn coffee 3-4 times daily',
          'Cover at night and during rain',
          'Test moisture content regularly',
        ],
      },
      quality: {
        answer: 'Quality coffee requires attention at every stage: proper harvesting, timely processing, correct drying, and careful storage. Avoid defects like mold, insect damage, and broken beans.',
        tips: [
          'Pick only ripe cherries',
          'Process within 24 hours',
          'Dry to 10-12% moisture',
          'Store in cool, dry place',
        ],
      },
    },
    sw: { // Swahili responses
      pest: {
        answer: 'Wadudu wa kahawa kama Coffee Berry Borer na Kutu la Majani wanaweza kupunguza mavuno sana. Udhibiti Unaochanganya wa Wadudu (IPM) unachanganya mbinu za kitamaduni, kibiolojia, na kikemia.',
        tips: [
          'Kagua mashamba kila wiki',
          'Ondoa na uharibu matunda yaliyoathirika',
          'Tumia mitego ya kunata',
          'Tumia dawa za wadudu za asili',
        ],
      },
    },
    rw: { // Kinyarwanda responses
      pest: {
        answer: 'Udukoko tw\'ikawa nka Coffee Berry Borer n\'Umwagara w\'Amababi bishobora kugabanya umusaruro cyane. Gukoresha uburyo bw\'indwara butandukanye ni ingenzi.',
        tips: [
          'Suzuma umurima buri cyumweru',
          'Kuramo kandi usenya imbuto zibasiwe',
          'Koresha umutego wo gukoresha',
          'Koresha imiti kamere iyo bikenewe',
        ],
      },
    },
  };

  const langResponses = responses[language] || responses.en;

  // Match keywords to topics
  for (const [topic, data] of Object.entries(langResponses)) {
    if (keywords.some(kw => kw.includes(topic) || topic.includes(kw))) {
      return {
        answer: data.answer,
        tips: data.tips,
        topic,
      };
    }
  }

  // Default response
  const defaultResponses = {
    en: {
      answer: 'I can help you with information about coffee farming, including pest management, diseases, harvesting, soil health, fertilization, pruning, drying, and quality control. Please ask a specific question or browse our training content below.',
      tips: [
        'Be specific in your questions',
        'Check the recommended training content',
        'Join community discussions',
        'Contact an agronomist for personalized advice',
      ],
    },
    sw: {
      answer: 'Ninaweza kukusaidia na maelezo kuhusu kilimo cha kahawa, ikiwa ni pamoja na udhibiti wa wadudu, magonjwa, kuvuna, afya ya udongo, mbolea, kukata, kukausha, na udhibiti wa ubora.',
      tips: [
        'Kuwa mahususi katika maswali yako',
        'Angalia maudhui ya mafunzo yaliyopendekezwa',
        'Jiunge na majadiliano ya jamii',
        'Wasiliana na mtaalamu wa kilimo',
      ],
    },
    rw: {
      answer: 'Nshobora kugufasha amakuru yerekeye ubuhinzi bw\'ikawa, harimo kurwanya udukoko, indwara, gusarura, ubuzima bw\'ubutaka, ifumbire, gukata, gukamisha, n\'igenzura ry\'ubuziranenge.',
      tips: [
        'Ba umwihariko mu bibazo byawe',
        'Reba ibintu byigwa byasabwe',
        'Injira mu biganiro by\'abaturage',
        'Hamagara umuhanga mu buhinzi',
      ],
    },
  };

  return defaultResponses[language] || defaultResponses.en;
}
