# DevMind AI

DevMind AI is an AI-powered developer assistant designed to help developers understand, explore, and work with software projects.

The application combines modern web development with LLM capabilities, including streaming responses, structured AI output, document retrieval, tool calling, AI agents, and MCP.

## Features

* AI-powered developer chat
* Streaming AI responses
* Conversation history
* Structured AI responses
* Document and knowledge retrieval
* Semantic search
* Retrieval-Augmented Generation (RAG)
* Developer-focused AI tools
* AI agent workflows
* MCP integration
* Authentication and authorization
* AI application security
* Evaluation and observability

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js Route Handlers
* REST APIs
* Gemini API

### Data & AI

* PostgreSQL
* Prisma
* pgvector
* Zod
* Embeddings
* RAG
* LLM tool calling
* AI agents
* MCP

### Infrastructure

* Docker
* Azure

## Architecture

```text
┌──────────────┐
│    React     │
│   Next.js    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Next.js API │
│   Backend    │
└──────┬───────┘
       │
       ├───────────────┐
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│  Gemini API  │  │ PostgreSQL   │
│     LLM      │  │   + pgvector │
└──────────────┘  └──────────────┘
```

## Development Roadmap

### Phase 1 — AI Chat

* [x] Gemini API integration
* [x] Next.js API route
* [x] Streaming responses

### Phase 2 — Application Features

* [x] Conversation history
* [ ] Structured AI output
* [ ] Zod validation

### Phase 3 — Knowledge & RAG

* [ ] Document processing
* [ ] Embeddings
* [ ] PostgreSQL
* [ ] pgvector
* [ ] Semantic search
* [ ] RAG
* [ ] Source citations

### Phase 4 — AI Agents

* [ ] Tool calling
* [ ] Developer tools
* [ ] Agent workflows
* [ ] Agent state and memory
* [ ] MCP

### Phase 5 — Production

* [ ] Authentication
* [ ] Authorization
* [ ] Security
* [ ] AI evaluation
* [ ] Observability
* [ ] Rate limiting
* [ ] Cost optimization

### Phase 6 — Deployment

* [ ] Docker
* [ ] Azure
* [ ] Production deployment

## Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit API keys or other secrets to the repository.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Project Status

DevMind AI is under active development, with new AI capabilities being added incrementally.
