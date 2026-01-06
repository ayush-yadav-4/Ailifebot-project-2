# CGMSCL React Application

## Project Structure

```
templates/
├── public/
│   └── index.html          # Main HTML with CDN scripts
├── src/
│   ├── components/
│   │   ├── App.js          # Main app component
│   │   ├── common/         # Common components
│   │   │   ├── LoadingScreen.js
│   │   │   ├── AnalysisDropdown.js
│   │   │   ├── AnalysisPanel.js
│   │   │   └── VersionDisclaimer.js
│   │   ├── welcome/        # Welcome screen components
│   │   │   ├── WelcomeHeader.js
│   │   │   ├── TopRightControls.js
│   │   │   ├── SearchBox.js
│   │   │   ├── PromptCard.js
│   │   │   └── AnalysisToggle.js
│   │   ├── chat/           # Chat interface components
│   │   │   ├── Chart.js
│   │   │   ├── ChatArea.js
│   │   │   ├── ChatHeader.js
│   │   │   ├── ChatMessages.js
│   │   │   ├── ChatInput.js
│   │   │   ├── MessageBubble.js
│   │   │   └── MessageActions.js
│   │   ├── settings/       # Settings components
│   │   │   └── SettingsDropdown.js
│   │   └── modals/        # Modal components
│   │       ├── PromptGalleryModal.js
│   │       └── CardPromptModal.js
│   ├── hooks/             # Custom React hooks
│   │   ├── useChat.js
│   │   ├── useChartRenderer.js
│   │   ├── useMarkdownRenderer.js
│   │   └── useMathJaxRenderer.js
│   ├── data/              # Data files
│   │   └── promptCards.js
│   ├── styles/
│   │   ├── App.css        # All CSS extracted from igl.html
│   │   └── Responsive.mobile.css
│   └── index.js           # React entry point
├── package.json
└── README.md
```

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The app will run on `http://localhost:3000`

## Features Implemented

✅ **Welcome Screen**
- Prompt cards with dropdown options
- Search interface with suggestions
- Extended cards with "See More" functionality
- Header with logo and controls

✅ **Chat Interface**
- Message display with user/bot distinction
- Message actions (copy, feedback)
- Chat input with voice recognition
- Message history persistence

✅ **Settings & Controls**
- Settings dropdown menu
- Analysis mode toggle
- Excel download functionality
- New chat button

✅ **Modals**
- Prompt Gallery modal
- Feedback modal

✅ **Hooks & Utilities**
- Chat management hook
- Speech recognition hook
- Chart rendering hook
- Markdown rendering hook
- MathJax rendering hook

## Features Still Needing Implementation

The following features from the original HTML need to be fully implemented:

1. **Chart Rendering** - Complete implementation of ECharts and Plotly rendering
2. **Speech Recognition** - Full integration with PocketSphinx.js
3. **Text-to-Speech** - TTS functionality for reading responses
4. **Analysis Panel** - Complete analysis data tracking and display
5. **Prompt Management** - Add/Edit/Delete prompts functionality
6. **Feedback System** - Enhanced feedback with analytics
7. **File Downloads** - PDF and Excel download functionality
8. **External Links** - Automatic external link handling
9. **All JavaScript Functions** - Many utility functions need to be converted

## Key Differences from HTML Version

1. **Component-based**: Code split into reusable React components
2. **State Management**: Using React hooks (useState, useEffect, useRef)
3. **Event Handling**: Converted to React event handlers
4. **CSS**: Extracted into `src/styles/App.css` (180k characters)
5. **Modular Structure**: Each feature in its own component/hook

## Next Steps

To complete the refactoring:

1. **Implement Chart Rendering**: Complete `useChartRenderer.js` with full ECharts/Plotly support
2. **Complete Speech Recognition**: Finish `useSpeechRecognition.js` integration
3. **Add Utility Functions**: Convert remaining JavaScript functions to React utilities
4. **Implement Missing Features**: Add all remaining functionality from original HTML
5. **Testing**: Test all features to ensure they work identically to the original

## Notes

- All CSS has been extracted and preserved exactly as in the original
- All external CDN scripts are loaded in `public/index.html`
- The structure is modular and maintainable
- Components follow React best practices

