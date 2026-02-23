import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Code2, Eye, Send, Loader2, Download, Monitor, Smartphone, Tablet, LayoutTemplate, Wand2, Copy, Check, RotateCw, History, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for Prism

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ prompt: string; code: string; timestamp: number }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const examplePrompts = [
    "A modern landing page for a coffee shop with a dark theme, hero section, and menu",
    "A portfolio website for a photographer with a gallery grid and contact form",
    "A SaaS product landing page with pricing tables and feature sections",
    "A restaurant website with online menu and reservation form"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the website you want to build.');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setCode('');
    setActiveTab('code'); // Switch to code tab to see it streaming
    
    try {
      const systemPrompt = `You are an expert web developer and designer. 
Create a complete, single-file HTML website based on the user's request.

CRITICAL REQUIREMENTS:
1. Return ONLY valid HTML code. 
2. DO NOT wrap the code in markdown code blocks (e.g., no \`\`\`html or \`\`\`). Start directly with <!DOCTYPE html>.
3. Include all CSS within a <style> tag in the <head>.
4. Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>) for styling.
5. Include any necessary JavaScript within a <script> tag at the end of the <body>.
6. Make the design modern, beautiful, responsive, and accessible.
7. Use high-quality placeholder images from https://picsum.photos (e.g., https://picsum.photos/seed/picsum/800/600) if images are needed.
8. Ensure the code is clean, well-structured, and semantic.
9. Add some subtle animations or hover effects using Tailwind classes to make it feel premium.
10. Include essential SEO meta tags in the <head> section: viewport, title, description, and keywords. Use placeholder values for title and description that can be customized later.
11. Include a favicon link tag in the <head>. You can use a data URI with an emoji as a simple placeholder favicon (e.g., <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>">).
12. Add custom CSS within the <style> tag to style the scrollbars for a more modern look and feel, especially for the main content area.
13. Include a footer section with placeholder social media links (e.g., Facebook, Twitter, Instagram) using SVG icons.
14. Ensure the website has a prominent hero section with a compelling headline, a subheadline, and a call-to-action button.
15. Add a sticky navigation bar to the top of the page with links for 'Home', 'About', and 'Contact'. Use placeholder URLs for the links.
16. Ensure the design is fully responsive across all device sizes. Implement a mobile-first approach, using Tailwind's responsive utility classes (e.g., sm:, md:, lg:) effectively.
`;

      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const result = await model.generateContentStream(`${systemPrompt}\n\nUser Request: "${prompt}"`);

      let generatedCode = '';
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          generatedCode += chunkText;
          setCode(generatedCode);
        }
      }
      
      // Extract HTML from markdown if present (after generation is complete)
      let finalCode = generatedCode;
      const htmlMatch = finalCode.match(/```(?:html)?\n([\s\S]*?)```/);
      if (htmlMatch) {
        finalCode = htmlMatch[1];
      } else {
        // Fallback cleanup
        finalCode = finalCode.replace(/^```html\n/, '').replace(/\n```$/, '');
      }
      
      setCode(finalCode);
      setActiveTab('preview');
      
      // Add to history
      setHistory(prev => [{
        prompt,
        code: finalCode,
        timestamp: Date.now()
      }, ...prev].slice(0, 10)); // Keep last 10
    } catch (err: any) {
      console.error('Generation error:', err);
      const errorMessage = err?.message || err?.toString() || 'Failed to generate website. Please try again.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (prompt.trim()) {
      handleGenerate();
    }
  };

  const loadFromHistory = (item: { prompt: string; code: string }) => {
    setPrompt(item.prompt);
    setCode(item.code);
    setActiveTab('preview');
    setShowHistory(false);
  };

  const handleScrapeUrl = async () => {
    if (!urlToScrape.trim()) {
      setError('Please enter a valid URL to scrape.');
      return;
    }

    setIsScrapingUrl(true);
    setError(null);

    try {
      // Fetch the webpage content
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlToScrape)}`);
      const data = await response.json();
      const htmlContent = data.contents;

      // Extract text content and structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Get page title and meta description
      const title = doc.querySelector('title')?.textContent || 'Untitled';
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Get all images
      const images = Array.from(doc.querySelectorAll('img'))
        .map(img => {
          const src = img.getAttribute('src') || '';
          const alt = img.getAttribute('alt') || '';
          // Convert relative URLs to absolute
          let fullUrl = src;
          if (src.startsWith('/')) {
            const urlObj = new URL(urlToScrape);
            fullUrl = `${urlObj.origin}${src}`;
          } else if (!src.startsWith('http')) {
            const urlObj = new URL(urlToScrape);
            fullUrl = `${urlObj.origin}/${src}`;
          }
          return { src: fullUrl, alt };
        })
        .filter(img => img.src && !img.src.includes('data:image'))
        .slice(0, 10); // Limit to 10 images
      
      // Get main headings
      const h1 = doc.querySelector('h1')?.textContent?.trim() || '';
      const headings = Array.from(doc.querySelectorAll('h2, h3'))
        .map(h => h.textContent?.trim())
        .filter(Boolean)
        .slice(0, 8);
      
      // Get paragraphs
      const paragraphs = Array.from(doc.querySelectorAll('p'))
        .map(p => p.textContent?.trim())
        .filter(text => text && text.length > 30)
        .slice(0, 5);

      // Get links from navigation
      const navLinks = Array.from(doc.querySelectorAll('nav a, header a'))
        .map(a => a.textContent?.trim())
        .filter(Boolean)
        .slice(0, 6);

      // Get color scheme
      const bodyStyle = doc.body.style;
      const bgColor = bodyStyle.backgroundColor || 'white';

      // Build comprehensive analysis prompt
      const analysisPrompt = `Analyze and recreate this website with modern design:

**Original Site:** ${urlToScrape}

**Page Information:**
- Title: ${title}
- Description: ${metaDescription}
- Main Heading: ${h1}

**Navigation Links:** ${navLinks.join(', ') || 'Home, About, Services, Contact'}

**Section Headings:**
${headings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

**Content Samples:**
${paragraphs.slice(0, 3).map((p, i) => `${i + 1}. ${p.substring(0, 150)}...`).join('\n')}

**Images Found (${images.length}):**
${images.slice(0, 5).map((img, i) => `${i + 1}. ${img.alt || 'Image'} - ${img.src}`).join('\n')}

**Design Instructions:**
- Use the actual images from the URLs above in your HTML
- Keep the same content structure and sections
- Make it modern with Tailwind CSS
- Use similar color scheme (detected: ${bgColor})
- Include all navigation links
- Maintain the same page flow and hierarchy
- Add smooth animations and hover effects
- Make it fully responsive`;

      setPrompt(analysisPrompt);
      setUrlToScrape('');
      setIsScrapingUrl(false);
      
      // Auto-generate after scraping
      setTimeout(() => handleGenerate(), 100);
    } catch (err: any) {
      console.error('Scraping error:', err);
      setError('Failed to scrape URL. Try entering the website description manually.');
      setIsScrapingUrl(false);
    }
  };

  const handleChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const chatHistory = chatMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });

      const systemContext = `You are a helpful AI assistant for a website builder app. 
Help users decide what kind of website they want to build. 
Ask questions about their business, style preferences, features they need, etc.
Be friendly, conversational, and guide them step by step.
When they're ready, suggest a detailed prompt they can use to generate their website.`;

      const result = await chat.sendMessage(systemContext + '\n\nUser: ' + userMessage);
      const response = await result.response;
      const text = response.text();

      setChatMessages(prev => [...prev, { role: 'assistant', content: text }]);
      setIsChatLoading(false);
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
      setIsChatLoading(false);
    }
  };

  const useChatSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    setShowChat(false);
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-zinc-800/50 flex flex-col bg-zinc-900/30 backdrop-blur-xl z-10 shadow-2xl">
        <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-zinc-100 tracking-tight">AI Builder</h1>
              <p className="text-xs text-zinc-500 font-medium">Powered by Gemini</p>
            </div>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-all"
            title="Chat with AI"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* URL Scraper */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Clone from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlToScrape}
                onChange={(e) => setUrlToScrape(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              <button
                onClick={handleScrapeUrl}
                disabled={isScrapingUrl || isGenerating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg disabled:shadow-none"
              >
                {isScrapingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-zinc-500">Enter a website URL to analyze and recreate</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900/30 px-2 text-zinc-500">OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" />
                Describe your website
              </label>
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
                >
                  <History className="w-3 h-3" />
                  History
                </button>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A modern landing page for a coffee shop with a dark theme, hero section, features, and a contact form..."
              className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none shadow-inner"
            />
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Quick Examples</label>
            <div className="space-y-2">
              {examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className="w-full text-left text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800/50 rounded-lg p-2 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-900 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Generate
                </>
              )}
            </button>
            {code && !isGenerating && (
              <button
                onClick={handleRegenerate}
                className="py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                title="Regenerate"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
        {/* Toolbar */}
        <div className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 bg-zinc-950/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 shadow-sm">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'preview' 
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                activeTab === 'code' 
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              Code
            </button>
          </div>

          {code && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              {activeTab === 'preview' && (
                <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 shadow-sm">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                    title="Desktop View"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`p-2 rounded-lg transition-all ${previewMode === 'tablet' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                    title="Tablet View"
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                    title="Mobile View"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="w-px h-6 bg-zinc-800 mx-1" />
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl transition-all shadow-sm"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-xl transition-all shadow-sm"
                title="Download HTML"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat opacity-[0.99]">
          <AnimatePresence mode="wait">
            {!code && !isGenerating ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500"
              >
                <div className="w-24 h-24 rounded-3xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center mb-6 shadow-2xl">
                  <LayoutTemplate className="w-10 h-10 text-zinc-600" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-300 mb-2">No website generated yet</h2>
                <p className="text-zinc-500 max-w-sm text-center">Describe what you want to build in the sidebar and let AI do the magic.</p>
              </motion.div>
            ) : isGenerating && !code ? (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                  <Loader2 className="w-16 h-16 animate-spin text-indigo-400 relative z-10" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-2">Designing your website...</h2>
                <p className="text-zinc-500">Writing HTML, CSS, and adding some magic.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                {activeTab === 'preview' ? (
                  <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
                    <motion.div 
                      layout
                      className={`bg-white rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out border border-zinc-800/50 ${
                        previewMode === 'desktop' ? 'w-full h-full' : 
                        previewMode === 'tablet' ? 'w-[768px] h-[1024px] max-h-full shrink-0' : 
                        'w-[375px] h-[812px] max-h-full shrink-0'
                      }`}
                    >
                      {/* Browser Chrome for mobile/tablet */}
                      {previewMode !== 'desktop' && (
                        <div className="h-6 bg-zinc-100 border-b border-zinc-200 flex items-center justify-center">
                          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
                        </div>
                      )}
                      <iframe
                        srcDoc={code}
                        title="Preview"
                        className="w-full h-full border-0 bg-white"
                      />
                    </motion.div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#1d1f21] p-6 overflow-auto">
                    <Editor
                      value={code}
                      onValueChange={code => setCode(code)}
                      highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
                      padding={10}
                      className="font-mono text-[13px] leading-relaxed selection:bg-indigo-500/30 min-h-full"
                      style={{
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        backgroundColor: 'transparent',
                        color: '#c5c8c6',
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              className="fixed left-80 top-0 bottom-0 w-80 bg-zinc-900 border-r border-zinc-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  History
                </h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl transition-all group"
                  >
                    <p className="text-sm text-zinc-300 line-clamp-2 mb-2 group-hover:text-zinc-100">
                      {item.prompt}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowChat(false)}
            />
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Assistant
                </h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-zinc-400 hover:text-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-zinc-500 mt-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Hi! I'm here to help you build your website.</p>
                    <p className="text-xs mt-2">Ask me anything about what you want to create!</p>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                  <button
                    onClick={handleChatMessage}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
