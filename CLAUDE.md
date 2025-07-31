# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page web application for studying Seth Materials Early Sessions Book 2 (赛斯资料早期课第二册). The application is built as a static HTML page with embedded JavaScript and provides an interactive learning platform with AI chat functionality.

## Architecture

### Single File Structure
- **index.html**: Contains the entire application - HTML structure, CSS styles, and JavaScript functionality in one file
- No build process, configuration files, or package management - runs directly in browser

### Key Components

**Content Management System**
- Session data embedded as JavaScript string (`fullText`) containing markdown
- Dynamic parsing of book overview and individual session summaries
- Dropdown navigation for 85+ sessions (Session 43-85)

**UI Framework**
- TailwindCSS via CDN for styling
- Marked.js library for markdown parsing
- Custom CSS for dark theme with backdrop blur effects
- Responsive design with sidebar navigation

**AI Chat Integration**
- Integrated chat widget using Dify API
- Session persistence via sessionStorage
- Streaming responses with loading states
- Chat history maintained across page refreshes

### Content Structure
- Book overview section explaining Seth Materials concepts
- Individual session summaries with detailed metaphysical teachings
- Content organized chronologically by session number
- All text in Traditional Chinese

## Development

### Running the Application
Simply open `index.html` in a web browser - no server or build process required.

### Making Content Changes
Edit the `fullText` JavaScript variable (lines 166-420) to modify book content. Content uses markdown formatting and follows a specific structure pattern.

### API Configuration
The Dify API integration uses:
- Base URL: `https://pro.aifunbox.com/v1/chat-messages`
- API Key: `app-tEivDPsjZY6phvYSqscy9Cqr` (hardcoded in line 501)

### Styling
- Dark theme with cosmic background image
- Custom scrollbar styling
- Font families: 'Noto Serif SC' for headings, 'Noto Sans SC' for body text
- Chat bubbles with different styles for user vs AI messages