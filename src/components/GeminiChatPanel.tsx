import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Sparkles,
  Zap,
  Cpu,
  BookOpen,
  Globe,
  Tag,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export type GeminiModelChoice = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-flash-latest';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatPanelProps {
  mode: 'global-floating' | 'browser-sidebar';
  isOpen: boolean;
  onClose: () => void;
  contextTitle?: string;
  contextText?: string;
  contextType?: 'vault' | 'browser' | 'general';
  onAddTagToItem?: (tag: string) => void;
}

const INITIAL_GREETING_VAULT = `您好！我是 **OmniKnowledge Gemini 智能知识助手**（由 \`gemini-3.8-flash\` 驱动）。
我可以帮您：
- 🔍 **多模态格式解析**：解读 CAD/DXF、PSD、RAW 相机原片、无损音视频或代码工程；
- 🕸️ **双向图谱与引用**：规划条目之间的 \`[[WikiLink]]\` 关联与核心标签体系；
- ⚡ **本地优先架构**：提供 Windows 离线搜索与向量化部署建议。

请问有什么我可以协助您的？`;

const INITIAL_GREETING_BROWSER = `您好！我是 **Gemini 网页伴读助手**。
我已经就绪，可以实时辅助您：
- 📑 **提炼网页核心要点**：总结维基百科词条、公众号深度长文或技术专栏；
- 🏷️ **智能提取标签**：自动分析网页关键词，方便一键归档入库；
- 🔗 **知识库关联推荐**：找出与当前网页主题匹配的本地已有资产。`;

export const GeminiChatPanel: React.FC<GeminiChatPanelProps> = ({
  mode,
  isOpen,
  onClose,
  contextTitle,
  contextText,
  contextType = 'general',
  onAddTagToItem,
}) => {
  const [selectedModel, setSelectedModel] = useState<GeminiModelChoice>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialGreeting =
    contextType === 'browser' ? INITIAL_GREETING_BROWSER : INITIAL_GREETING_VAULT;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: initialGreeting,
      timestamp: '刚刚',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const rawContent = (textToSend || inputMessage).trim();
    if (!rawContent || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: rawContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      let contextInfo = '';
      if (contextTitle) {
        contextInfo += `当前焦点资产/网页：${contextTitle}\n`;
      }
      if (contextText) {
        contextInfo += `正文/摘要摘录：\n${contextText.slice(0, 1500)}\n`;
      }

      const payloadMessages = nextMessages
        .filter((m) => m.id !== 'msg-init')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content,
        }));

      const finalPayload = payloadMessages.length > 0 ? payloadMessages : [{ role: 'user', content: rawContent }];

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: finalPayload,
          model: selectedModel,
          contextInfo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '请求 Gemini API 失败');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || '已收到，但我暂时未能生成回答。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model || selectedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ 生成回答时遇到问题：${err?.message || '网络连接或服务异常'}。\n您可以尝试切换模型或重试提问。`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-init-${Date.now()}`,
        role: 'assistant',
        content: initialGreeting,
        timestamp: '刚刚',
        modelUsed: selectedModel,
      },
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts =
    contextType === 'browser'
      ? [
          '提炼当前网页的 3 个关键结论',
          '为该网页生成 5 个精准语义标签',
          '分析与本地知识库的最佳关联方式',
        ]
      : [
          '如何使用 SQLite-vec 实现 70 种格式的混合检索？',
          '解释 AutoCAD DXF 与 PSD 图纸的图谱交叉引用设计',
          '为当前知识资产推荐关联分类与标签',
        ];

  const isSidebar = mode === 'browser-sidebar';

  return (
    <div
      className={
        isSidebar
          ? 'h-full w-80 md:w-96 flex flex-col bg-white border-l border-black/[0.08] shadow-lg shrink-0 z-30 transition-all'
          : `fixed bottom-5 right-5 z-50 flex flex-col bg-white rounded-3xl apple-card border border-black/10 shadow-2xl overflow-hidden transition-all duration-200 ${
              isExpanded
                ? 'w-[92vw] sm:w-[620px] h-[82vh]'
                : 'w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh]'
            }`
      }
    >
      {/* =====================================================================
          1. HEADER WITH APPLE HIG GLASSMORPHISM & MODEL TOGGLE
         ===================================================================== */}
      <div className="px-4 py-3 bg-[#FBFBFD] border-b border-black/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#0071E3] to-[#5856D6] text-white flex items-center justify-center shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#1D1D1F] truncate">Gemini 智能助手</span>
              {isSidebar && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#0071E3]/10 text-[#0071E3] text-[10px] font-medium shrink-0">
                  浏览器伴读
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#86868B] flex items-center gap-1 truncate">
              {contextTitle ? (
                <>
                  <span className="truncate max-w-[160px]">聚焦: {contextTitle}</span>
                </>
              ) : (
                <span>全局知识交互</span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Model Selector Dropdown */}
          <select
            aria-label="选择 Gemini 模型"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as GeminiModelChoice)}
            className="text-[11px] font-mono px-2 py-1 rounded-lg bg-black/[0.04] hover:bg-black/[0.07] border border-black/[0.06] text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            title="选择要使用的 Gemini 模型"
          >
            <option value="gemini-3.8-flash">3.8 Flash (推荐通用)</option>
            <option value="gemini-3.1-flash-lite">3.1 Flash-Lite (超高速)</option>
            <option value="gemini-flash-latest">Flash Latest (最新版)</option>
          </select>

          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors"
            title="清空聊天记录"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {!isSidebar && (
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors"
              title={isExpanded ? '还原大小' : '展开窗口'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-colors"
            title="关闭助手"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Context Indicator Pill */}
      {contextTitle && (
        <div className="px-4 py-1.5 bg-[#F5F5F7] border-b border-black/[0.04] text-[11px] text-[#424245] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            {contextType === 'browser' ? (
              <Globe className="w-3 h-3 text-[#0071E3] shrink-0" />
            ) : (
              <BookOpen className="w-3 h-3 text-[#0071E3] shrink-0" />
            )}
            <span className="truncate">伴读上下文：{contextTitle}</span>
          </div>
          <span className="text-[10px] text-[#86868B] shrink-0 font-mono">已注入Prompt</span>
        </div>
      )}

      {/* =====================================================================
          2. SCROLLABLE MESSAGE THREAD
         ===================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words shadow-2xs ${
                  isUser
                    ? 'bg-[#0071E3] text-white rounded-br-sm'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] rounded-bl-sm border border-black/[0.04]'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Message Footer: Model badge + Timestamp + Copy */}
              <div className="flex items-center gap-2 px-1 text-[10px] text-[#86868B]">
                {!isUser && msg.modelUsed && (
                  <span className="font-mono text-[#0071E3] font-medium">{msg.modelUsed}</span>
                )}
                <span>{msg.timestamp}</span>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="hover:text-[#1D1D1F] inline-flex items-center gap-0.5"
                    title="复制回答"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-2.5 h-2.5 text-[#34C759]" />
                        <span className="text-[#34C759]">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-2.5 h-2.5" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#F5F5F7] max-w-[70%] text-xs text-[#86868B] animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0071E3]" />
            <span>Gemini 正在思考与总结回复...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* =====================================================================
          3. QUICK PROMPT SUGGESTIONS (HORIZONTAL CHIPS)
         ===================================================================== */}
      <div className="px-3 pt-2 pb-1 bg-white border-t border-black/[0.04] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] text-[#86868B] shrink-0">快捷建议:</span>
        {quickPrompts.map((promptText) => (
          <button
            key={promptText}
            type="button"
            onClick={() => handleSendMessage(promptText)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#424245] whitespace-nowrap shrink-0 transition-colors"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* =====================================================================
          4. MULTI-TURN INPUT COMPOSER
         ===================================================================== */}
      <div className="p-3 bg-[#FBFBFD] border-t border-black/[0.06] shrink-0">
        <div className="relative flex items-end rounded-2xl bg-white border border-black/10 focus-within:ring-2 focus-within:ring-[#0071E3] transition-all p-1.5 shadow-2xs">
          <textarea
            ref={inputRef}
            rows={2}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              contextTitle
                ? `关于「${contextTitle}」向 Gemini 提问 (Enter 发送)...`
                : '输入问题，与 Gemini 对话 (Enter 发送)...'
            }
            className="w-full resize-none px-2 py-1 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] disabled:opacity-40 text-white transition-all shrink-0 shadow-2xs"
            title="发送 (Enter)"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#86868B] px-1 mt-1.5">
          <span>Shift + Enter 换行 · Enter 发送</span>
          <span>Google Gemini API</span>
        </div>
      </div>
    </div>
  );
};
