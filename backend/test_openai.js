require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

(async () => {
  console.log('🧪 Test OpenAI API...\n');
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Traduis "Bonjour" en anglais (1 mot)' }],
      max_tokens: 10
    });
    
    console.log('✅ SUCCÈS ! Traduction:', response.choices[0].message.content);
    console.log('📊 Tokens utilisés:', response.usage);
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
    
    if (error.message.includes('model')) {
      console.log('\n⚠️ Le modèle gpt-4o-mini n\'existe peut-être pas/plus !');
      console.log('💡 Modèles alternatifs : gpt-4.1-mini, o4-mini');
    }
  }
})();
