import React, { useState } from 'react';
import { FileText, Link, Sparkles, Copy, Download } from 'lucide-react';

const CinemaExpressRewriter = () => {
  const [inputs, setInputs] = useState({
    newsLink: '',
    referenceArticle: '',
    previousArticle: '',
    tone: 'playful',
    contentType: 'generic'
  });
  const [output, setOutput] = useState({
    headline: '',
    strap: '',
    article: '',
    seoKeywords: []
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateArticle = async () => {
    if (!inputs.newsLink.trim()) {
      alert('Please provide at least a news update link or content to proceed.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const getToneInstructions = (tone) => {
        switch(tone) {
          case 'formal':
            return `FORMAL UNBIASED TONE:
- Write in neutral, professional journalism style
- Use formal language without contractions
- Maintain objectivity and balance
- Use "The film" instead of "The film's got"
- Professional headlines and reporting tone
- No playful elements or casual expressions`;
          case 'reports':
            return `REPORTS COPY TONE:
- Add ": Reports" at the end of the headline
- Use cautious language like "reportedly", "according to sources", "it is reported that"
- Mention this is based on unconfirmed reports from other media
- Maintain neutral tone but acknowledge the speculative nature
- Use phrases like "if reports are to be believed", "sources suggest"`;
          default:
            return `PLAYFUL HUMAN TONE (Cinema Express Style):
- Conversational, warm, and engaging
- Use contractions (it's, don't, we're)
- Be playful with trailers, songs, and announcements
- Write like chatting with fellow film lovers
- Natural excitement and personality`;
        }
      };

      const getContentTypeInstructions = (contentType) => {
        switch(contentType) {
          case 'quotes':
            return `QUOTES COPY FORMAT:
- Pick the most engaging/spicy quote as the central focus
- Structure the article around this key quote
- Provide context about when/where this was said
- Add relevant background about the celebrity/topic
- Use the quote to drive the narrative
- Headline should highlight the key quote or its implication`;
          case 'trailer':
            return `TRAILER/TEASER FORMAT:
- Headline format: "[Movie Name] trailer: [description]" or "[Movie Name] teaser: [description]"
- Describe key scenes, tone, and visual highlights
- Mention cast appearances and standout moments
- Include technical aspects like music, cinematography if notable
- Build anticipation and excitement`;
          case 'song':
            return `SONG FORMAT:
- Headline format: "'[Song Name]' from [Movie Name]: [description]"
- Describe the musical style, mood, and feel
- Mention singers, composers, lyricists
- Describe visuals if it's a video song
- Include any dance sequences or picturisation details`;
          case 'firstlook':
            return `FIRST LOOK POSTER FORMAT:
- Headline format: "[Movie Name] first look: [description]"
- Describe the poster's visual elements, mood, and style
- Mention character looks, costumes, settings visible
- Discuss the poster's design and what it reveals about the film
- Build curiosity about the character or story`;
          default:
            return `GENERIC FORMAT:
- Standard news article structure
- Flexible headline based on the news content
- Comprehensive coverage of the topic
- Include all relevant details and context`;
        }
      };

      const prompt = `You are an entertainment journalist for Cinema Express, India's leading film publication.

INPUT INFORMATION:
- News Update Link/Content: ${inputs.newsLink}
- Reference Article: ${inputs.referenceArticle}
- Previous Cinema Express Article: ${inputs.previousArticle}

TONE STYLE:
${getToneInstructions(inputs.tone)}

CONTENT TYPE:
${getContentTypeInstructions(inputs.contentType)}

FORMATTING REQUIREMENTS:
1. UK English spelling (realise, colour, favourite, etc.)
2. Sentence case headline (only first letter capitalised)
3. Engaging 15-25 word strap
4. Format movie names as **_Movie Name_** (bold and italic)
5. 300-400 words
6. Include ALL quotes from source material completely - never paraphrase direct quotes
7. Generate 7-8 high-SEO ranking keywords based on current search trends

${inputs.contentType === 'quotes' ? `
SPECIAL INSTRUCTIONS FOR QUOTES COPY:
- You are smart enough to research and add relevant context about the celebrity/topic
- Pick the most newsworthy/engaging quote as your centrepiece
- Add background information that makes the quote more meaningful
- Include recent projects, controversies, or relevant career details
- Make the article comprehensive, not just the quote
` : ''}

RESPONSE FORMAT - ONLY JSON:
{
  "headline": "Your headline in sentence case${inputs.tone === 'reports' ? ' ending with : Reports' : ''}",
  "strap": "Your 15-25 word strap", 
  "article": "Your 300-400 word article following the specified tone and content type",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"]
}

DO NOT include any text outside this JSON structure.`;

 // --- REPLACE DIRECT ANTHROPIC CALL WITH THIS ---
// --- START REPLACEMENT: call your serverless API instead of Anthropic directly ---
const serverRes = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, model: 'claude-sonnet-4-20250514', max_tokens: 1500 })
});

let data;
try {
  data = await serverRes.json();
} catch (err) {
  console.error('Failed parsing JSON from /api/generate', err);
  throw new Error('Invalid JSON from server');
}

if (!serverRes.ok) {
  console.error('Server returned error from /api/generate:', data);
  // show a useful error message for debugging
  throw new Error(data?.error || data?.message || 'Server error calling /api/generate');
}
const responseText = (data && data.content && data.content[0] && data.content[0].text)
  ? data.content[0].text
  : JSON.stringify(data);
     
      // Clean up potential markdown formatting
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const result = JSON.parse(responseText);
      
      setOutput({
        headline: result.headline || '',
        strap: result.strap || '',
        article: result.article || '',
        seoKeywords: result.seo_keywords || []
      });
      
    } catch (error) {
      console.error('Error generating article:', error);
      alert('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} copied to clipboard!`);
    });
  };

  const copyFullArticle = () => {
    const keywordsText = output.seoKeywords.length > 0 ? `\n\nSEO Keywords: ${output.seoKeywords.join(', ')}` : '';
    const fullText = `${output.headline}\n\n${output.strap}\n\n${output.article}${keywordsText}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Full article with SEO keywords copied to clipboard!');
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cinema Express Article Rewriter</h1>
        <p className="text-gray-600">Transform news updates into engaging Cinema Express articles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FileText className="mr-2" size={20} />
            Input Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone Style
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={inputs.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
              >
                <option value="playful">Playful Human Tone (Cinema Express Style)</option>
                <option value="formal">Formal Unbiased Tone</option>
                <option value="reports">Reports Copy Tone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={inputs.contentType}
                onChange={(e) => handleInputChange('contentType', e.target.value)}
              >
                <option value="generic">Generic</option>
                <option value="quotes">Quotes Copy</option>
                <option value="trailer">Trailer/Teaser</option>
                <option value="song">Song</option>
                <option value="firstlook">First Look Poster</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link size={16} className="inline mr-1" />
              News Update Link or Content *
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste the news link or copy the content here..."
              value={inputs.newsLink}
              onChange={(e) => handleInputChange('newsLink', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Article (Optional)
            </label>
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste reference article content..."
              value={inputs.referenceArticle}
              onChange={(e) => handleInputChange('referenceArticle', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Previous Cinema Express Article (Optional)
            </label>
            <textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste previous article for context..."
              value={inputs.previousArticle}
              onChange={(e) => handleInputChange('previousArticle', e.target.value)}
            />
          </div>

          <button
            onClick={generateArticle}
            disabled={isProcessing || !inputs.newsLink.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            {isProcessing ? (
              <>
                <Sparkles className="animate-spin mr-2" size={20} />
                Generating Article...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={20} />
                Generate Cinema Express Article
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Generated Article</h2>
          
          {output.headline && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Headline</h3>
                  <button
                    onClick={() => copyToClipboard(output.headline, 'Headline')}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-lg font-semibold text-gray-900">{output.headline}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Strap</h3>
                  <button
                    onClick={() => copyToClipboard(output.strap, 'Strap')}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-base text-gray-800 italic">{output.strap}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Article ({output.article.split(' ').length} words)</h3>
                  <button
                    onClick={() => copyToClipboard(output.article, 'Article')}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div 
                  className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: output.article
                      .replace(/\*\*_([^_]+)_\*\*/g, '<strong><em>$1</em></strong>')
                      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                      .replace(/_([^_]+)_/g, '<em>$1</em>')
                  }}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">SEO Keywords</h3>
                  <button
                    onClick={() => copyToClipboard(output.seoKeywords.join(', '), 'SEO Keywords')}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {output.seoKeywords.map((keyword, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={copyFullArticle}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
              >
                <Download className="mr-2" size={16} />
                Copy Complete Article
              </button>
            </div>
          )}

          {!output.headline && (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">Your generated article will appear here</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Advanced Cinema Express Features:</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <div>
            <strong>Tone Options:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li><strong>Playful Human:</strong> Conversational Cinema Express style with contractions and warmth</li>
              <li><strong>Formal Unbiased:</strong> Professional, neutral journalism for serious news</li>
              <li><strong>Reports Copy:</strong> Adds ": Reports" to headlines, uses cautious language for unconfirmed news</li>
            </ul>
          </div>
          <div>
            <strong>Content Types:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li><strong>Generic:</strong> Standard news coverage</li>
              <li><strong>Quotes Copy:</strong> Celebrity interview quotes with smart context addition</li>
              <li><strong>Trailer/Teaser:</strong> "Movie name trailer: description" format</li>
              <li><strong>Song:</strong> "'Song name' from movie: description" format</li>
              <li><strong>First Look Poster:</strong> "Movie name first look: description" format</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinemaExpressRewriter;