import { Send, Bot, Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Card } from "../components/ui/Card";
import { api } from "../services/api";

const suggestions = [
  { icon: TrendingUp, text: "How can I reduce my dining out expenses?", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: AlertTriangle, text: "Am I on track for my monthly savings goal?", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: Lightbulb, text: "Analyze my spending from last week.", color: "text-primary-400", bg: "bg-primary-400/10" }
];

export function AIInsights() {
  const userStr = localStorage.getItem("budgetiq_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const firstName = user?.full_name?.split(" ")?.[0] || "there";

  const [messages, setMessages] = useState([
    { role: "ai", content: `Hello ${firstName}! I'm your BudgetAI Assistant. I can analyze your transactions and help you make smarter financial decisions. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await api.post('/dashboard/ai_chat', { message: userMsg });
      setMessages(prev => [...prev, {
        role: "ai",
        content: res.response || "I could not process your request at this time. Please try again."
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "ai",
        content: "I'm having trouble connecting right now. Please check your connection and try again."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
    : "U";

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Chat panel */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-slate-700/60">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center gap-3 bg-slate-800/30 shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-50">BudgetAI Assistant</h2>
            <p className="text-xs text-primary-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Online and analyzing your data
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-2.5 max-w-[88%] md:max-w-[72%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === 'user' 
                    ? 'bg-slate-700 text-slate-300' 
                    : 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-md'
                }`}>
                  {msg.role === 'user' ? initials : <Bot size={15} className="text-white" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl shadow-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-800/30 border-t border-slate-700/50 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Ask anything about your finances..."
              className="flex-1 bg-slate-900/80 border border-slate-700/80 text-slate-50 text-sm rounded-xl pl-5 pr-4 py-3.5 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-slate-500 transition-colors disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="shrink-0 p-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-95"
              aria-label="Send message"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </Card>

      {/* Sidebar: suggestions */}
      <div className="lg:w-72 flex flex-col gap-4">
        <Card className="p-5 border-slate-700/60">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={17} className="text-primary-400" />
            <h3 className="font-semibold text-slate-50">Quick Prompts</h3>
          </div>
          <div className="space-y-2.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestion(s.text)}
                className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all text-left group"
              >
                <div className={`p-2 rounded-lg ${s.bg} ${s.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <s.icon size={15} />
                </div>
                <span className="text-slate-400 group-hover:text-slate-100 text-sm leading-snug mt-0.5">{s.text}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-slate-700/60 bg-gradient-to-b from-primary-900/20 to-slate-900/20">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="text-primary-400 font-medium">BudgetAI</span> analyzes your income and expense data to provide personalized insights. All data processing happens securely on your server.
          </p>
        </Card>
      </div>
    </div>
  );
}
