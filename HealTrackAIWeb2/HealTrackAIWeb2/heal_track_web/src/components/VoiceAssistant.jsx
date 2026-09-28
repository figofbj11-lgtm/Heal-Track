import React, { useState } from 'react';
import { Mic, MicOff, RefreshCw, Send, Volume2 } from 'lucide-react';

const voiceAnswers = {
  "upload today's wound image": "Navigating to the wound upload screen. Make sure there is good lighting and you hold the camera about ten centimeters from the wound.",
  "how is my wound": "Based on today's AI scan, your wound is eighty-two percent healed. This represents a good healing trend with only a four percent probability of infection.",
  "when should i take my medicine": "Your next medication is Ibuprofen four hundred milligrams scheduled for nine o'clock PM. Remember to take it with meals.",
  "book appointment": "Navigating to the appointment booking screen. I will retrieve available slots for Dr. Sarah Jenkins.",
  "show recovery graph": "Opening your recovery dashboard. Your healing has improved from fifteen percent on day one to eighty-two percent today.",
  "what precautions should i follow": "Please clean the wound twice daily, avoid direct sunlight, and do not submerge the wound in water. If you see active bleeding, seek medical attention.",
};

const suggestedPrompts = [
  "How is my wound?",
  "When should I take my medicine?",
  "Book appointment.",
  "What precautions should I follow?"
];

function VoiceAssistant({ isHC }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([
    { role: 'assistant', text: 'Hello John. How can I help with your healing progress today?' }
  ]);

  const handleCommand = async (command) => {
    setIsListening(false);
    
    // Add user message
    setConversation(old => [...old, { role: 'user', text: command }]);

    setIsSpeaking(true);
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600));

    const normalized = command.toLowerCase().trim().replace(/[?.]/g, '');
    let reply = "I didn't quite catch that. Try asking: 'How is my wound?', 'Book appointment', or 'When should I take my medicine?'.";

    for (let key in voiceAnswers) {
      if (normalized.includes(key) || key.includes(normalized)) {
        reply = voiceAnswers[key];
        break;
      }
    }

    setConversation(old => [...old, { role: 'assistant', text: reply }]);
    
    // Simulate speaking duration
    await new Promise(r => setTimeout(r, Math.max(1500, reply.length * 25)));
    setIsSpeaking(false);
  };

  const startListeningMock = () => {
    setIsListening(true);
    // Simulate short mic capture
    setTimeout(() => {
      handleCommand("How is my wound?");
    }, 2000);
  };

  const resetChat = () => {
    setConversation([
      { role: 'assistant', text: 'Hello John. How can I help with your healing progress today?' }
    ]);
    setIsListening(false);
    setIsSpeaking(false);
  };

  return (
    <div className={`p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 flex flex-col h-[400px] ${isHC ? 'thick-border' : ''}`}>
      <div className="flex justify-between items-center pb-3 border-b mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-500 animate-pulse" />
          <h4 className="font-bold text-sm">Voice AI Assistant</h4>
        </div>
        <button 
          onClick={resetChat}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 dark:hover:bg-slate-800"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 text-sm">
        {conversation.map((msg, i) => (
          <div 
            key={i} 
            className={`p-3 max-w-[80%] rounded-2xl leading-relaxed ${
              msg.role === 'assistant' 
                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-950 dark:text-blue-100 mr-auto rounded-tl-none border border-blue-100/50 dark:border-blue-900/20' 
                : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100 ml-auto rounded-tr-none border border-emerald-100/50 dark:border-emerald-900/20'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Voice animation */}
      {(isListening || isSpeaking) && (
        <div className="flex justify-center items-center gap-1 mb-4 h-8">
          {Array.from({ length: 9 }).map((_, i) => {
            const delay = `${i * 0.1}s`;
            return (
              <span 
                key={i} 
                className="w-1.5 bg-blue-600 rounded-full waveform-bar" 
                style={{ 
                  animationDelay: delay,
                  height: isListening ? '12px' : '6px'
                }}
              ></span>
            );
          })}
        </div>
      )}

      {/* Suggestion actions */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-2 shrink-0">
        {suggestedPrompts.map((p, i) => (
          <button 
            key={i}
            onClick={() => handleCommand(p)}
            className="text-[11px] font-bold bg-gray-150 hover:bg-gray-250 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full shrink-0 border border-gray-200 dark:border-slate-700"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input controls */}
      <div className="flex items-center gap-3">
        <button 
          onClick={startListeningMock}
          className={`flex-1 p-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
          }`}
        >
          <Mic className="w-4 h-4" />
          {isListening ? 'Listening (Saying "How is my wound?")...' : 'Hold to Speak'}
        </button>
      </div>
    </div>
  );
}

export default VoiceAssistant;
