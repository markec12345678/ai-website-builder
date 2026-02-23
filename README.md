# 🚀 AI Website Builder

A powerful AI-powered website builder that generates complete, modern websites using Google Gemini AI. Built with React, TypeScript, and Tailwind CSS.

![AI Website Builder](https://img.shields.io/badge/AI-Powered-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)

## ✨ Features

### 🤖 AI-Powered Generation
- Generate complete HTML websites from text descriptions
- Real-time streaming code generation
- Powered by Google Gemini 2.5 Flash

### 🌐 Website Cloning
- Clone any website by entering its URL
- Automatically extracts images, content, and structure
- Recreates modern versions with original assets

### 💬 AI Chat Assistant
- Interactive chat interface for guidance
- Get suggestions and recommendations
- Step-by-step website planning assistance

### 🎨 Advanced Features
- **Live Preview**: Desktop, tablet, and mobile views
- **Code Editor**: Syntax highlighting with Prism.js
- **History**: Save and restore previous generations
- **Quick Examples**: Pre-made prompts for inspiration
- **Copy & Export**: One-click code copying and HTML download
- **Regenerate**: Quickly regenerate with the same prompt

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Google Gemini API key ([Get one here](https://ai.google.dev/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-website-builder.git
cd ai-website-builder
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage

### Generate from Description
1. Enter a description of your website in the textarea
2. Click "Generate" button
3. Watch as AI creates your website in real-time
4. Preview in different device sizes
5. Copy code or export as HTML

### Clone from URL
1. Enter any website URL in the "Clone from URL" field
2. Click the eye icon
3. AI will analyze and recreate the website automatically

### Chat with AI
1. Click the chat icon in the header
2. Ask questions about what to build
3. Get personalized recommendations
4. Use AI-suggested prompts to generate

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini API
- **Animations**: Framer Motion
- **Code Editor**: react-simple-code-editor
- **Syntax Highlighting**: Prism.js
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Project Structure

```
ai-website-builder/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/
├── .env.local           # Environment variables (create this)
├── .env.example         # Example environment file
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 Features in Detail

### History Management
- Automatically saves last 10 generations
- Click "History" to view and restore previous websites
- Timestamps for easy tracking

### Responsive Preview
- Desktop view (full width)
- Tablet view (768px)
- Mobile view (375px)
- Smooth transitions between modes

### Code Editor
- Full syntax highlighting
- Editable code
- Dark theme optimized
- Copy to clipboard

### Example Prompts
- Coffee shop landing page
- Photographer portfolio
- SaaS product page
- Restaurant website

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://ai.google.dev/)

## 🚢 Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker
```bash
docker build -t ai-website-builder .
docker run -p 3000:3000 ai-website-builder
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- React team for the amazing framework
- Tailwind CSS for beautiful styling
- All open-source contributors

## 📧 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter)

Project Link: [https://github.com/yourusername/ai-website-builder](https://github.com/yourusername/ai-website-builder)

---

Made with ❤️ and AI
