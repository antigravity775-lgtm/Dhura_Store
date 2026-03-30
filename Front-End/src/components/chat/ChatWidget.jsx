import React, { useState, useRef, useEffect, Suspense } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { chatService } from '../../services/chatService';

/**
 * EN: Lazy-load ReactMarkdown + remarkGfm — these are ~45KB gzip combined.
 *     They're only needed when the chat window is open AND an assistant message
 *     needs rendering. By lazy-loading, we defer this cost entirely from the
 *     initial page load.
 * AR: تحميل كسول لـ ReactMarkdown + remarkGfm — حجمهما ~45KB gzip مجتمعاً.
 *     مطلوبان فقط عند فتح نافذة الدردشة وعرض رسالة المساعد.
 *     بالتحميل الكسول، نؤجل هذه التكلفة بالكامل عن التحميل الأولي.
 */
const ReactMarkdown = React.lazy(() => import('react-markdown'));

// EN: remarkGfm must be loaded as a module and passed as plugin.
//     We import it eagerly since it's tiny, but it's in the vendor-chat chunk
//     which is only loaded when ReactMarkdown is loaded.
let remarkGfmPlugin = null;
const loadRemarkGfm = import('remark-gfm').then(mod => {
  remarkGfmPlugin = mod.default;
});

/**
 * EN: Lightweight markdown fallback — shown while ReactMarkdown loads.
 *     Just renders the raw text so the user sees content immediately.
 * AR: بديل خفيف للماركداون — يُعرض أثناء تحميل ReactMarkdown.
 *     يعرض النص الخام فقط ليرى المستخدم المحتوى فوراً.
 */
const MarkdownFallback = ({ content }) => (
  <span className="whitespace-pre-wrap">{content}</span>
);

/**
 * EN: Wrapper that renders markdown with Suspense.
 * AR: غلاف يعرض الماركداون مع Suspense.
 */
const LazyMarkdown = ({ content }) => (
  <Suspense fallback={<MarkdownFallback content={content} />}>
    <ReactMarkdown remarkPlugins={remarkGfmPlugin ? [remarkGfmPlugin] : []}>
      {content}
    </ReactMarkdown>
  </Suspense>
);

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! 👋 How can I help you today?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    // 1. Force the scroll immediately without smooth behavior which often glitches on desktop
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView(false);
    }
    // 2. Fallback brute-force scroll on the container
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Fire it immediately and also after a short delay for ReactMarkdown images/rendering
    scrollToBottom();
    const timeout = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timeout);
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading || isRateLimited) return;

    const userMsg = { role: 'user', content: inputVal.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);
    setIsRateLimited(true);

    try {
      const response = await chatService.sendMessage(newMessages);
      if (response && response.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Oops! Something went wrong on our end. Please try again later.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRateLimited(false), 1500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[80vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right">
          
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold text-sm">Store Assistant</h3>
                <p className="text-xs text-indigo-200">Online & ready to help</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-3 overscroll-contain"
          >
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div 
                  key={idx} 
                  className={`flex gap-2 max-w-[85%] ${isAssistant ? 'self-start' : 'self-end flex-row-reverse'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAssistant ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div 
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      isAssistant 
                        ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-snug prose-ul:my-1 prose-li:my-0' 
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    }`}
                  >
                    {isAssistant ? (
                      <LazyMarkdown content={msg.content} />
                    ) : (
                      <>{msg.content}</>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] self-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl text-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-slate-500">Thinking...</span>
                  </div>
              </div>
            )}
            {/* The absolute ultimate bottom anchor */}
            <div ref={messagesEndRef} className="h-[1px] w-full flex-shrink-0" />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={isRateLimited ? "يرجى الانتظار قليلاً..." : "Type your message..."}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none placeholder-slate-400"
                disabled={isLoading || isRateLimited}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading || isRateLimited}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 ${
          isOpen ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatWidget;
