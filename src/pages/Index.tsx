import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Image, Camera, FileText, Download, Menu, Trash2, Plus } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useVoiceInput, speakText, stopSpeaking } from "@/hooks/use-voice";
import { ChatBubble } from "@/components/ChatBubble";
import { LearningModeSelector } from "@/components/LearningModeSelector";
import { StatusPanel } from "@/components/StatusPanel";
import { SessionSummary } from "@/components/SessionSummary";
import { SidebarLink } from "@/components/SidebarLink";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";

const SUGGESTIONS = [
  "What is nanotechnology?",
  "Explain recursion in programming",
  "Compare TCP vs UDP",
  "What is the Pythagorean theorem?",
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function exportAsHtmlDoc(content: string, title: string) {
  const html = `<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.7;}
h1{font-size:24px;border-bottom:2px solid #0d9488;padding-bottom:6px;}
h2{font-size:18px;margin-top:24px;color:#0d9488;}h3{font-size:15px;margin-top:16px;}
table{border-collapse:collapse;width:100%;margin:12px 0;}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;}
th{background:#f0fdfa;}code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px;}
pre{background:#f3f4f6;padding:16px;border-radius:8px;overflow-x:auto;}
ul,ol{padding-left:24px;}li{margin-bottom:4px;}</style></head><body>${markdownToHtml(content)}</body></html>`;

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "assignment"}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsPdf(content: string, title: string) {
  const html = `<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.7;}
h1{font-size:24px;border-bottom:2px solid #0d9488;padding-bottom:6px;}
h2{font-size:18px;margin-top:24px;color:#0d9488;}h3{font-size:15px;margin-top:16px;}
table{border-collapse:collapse;width:100%;margin:12px 0;}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left;}
th{background:#f0fdfa;}code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-size:13px;}
pre{background:#f3f4f6;padding:16px;border-radius:8px;overflow-x:auto;}
ul,ol{padding-left:24px;}li{margin-bottom:4px;}
@media print{body{margin:20px;}}</style></head><body>${markdownToHtml(content)}</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^\- (.*$)/gm, "<li>$1</li>")
    .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => {
      if (match.trim().startsWith("<li>")) return `<ul>${match}</ul>`;
      return match;
    })
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

const Index = () => {
  const { messages, isLoading, mode, setMode, emotion, confidence, topicsDiscussed, emotionJourney, sendMessage, clearMessages } = useChat();
  const { isListening, transcript, startListening, stopListening } = useVoiceInput();
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleSend = () => {
    if (!input.trim() && !pendingImage) return;
    sendMessage(input, pendingImage || undefined);
    setInput("");
    setPendingImage(null);
  };

  const handleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      const ok = startListening();
      if (!ok) alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB.");
      return;
    }
    const base64 = await fileToBase64(file);
    setPendingImage(base64);
    e.target.value = "";
  };

  const handleExport = (content: string, format: "pdf" | "doc") => {
    const titleMatch = content.match(/^#+ (.+)/m);
    const title = titleMatch ? titleMatch[1] : "Saarthi Assignment";
    if (format === "pdf") exportAsPdf(content, title);
    else exportAsHtmlDoc(content, title);
  };

  const handleNewChat = () => {
    clearMessages();
    stopSpeaking();
    setIsSpeaking(false);
    setPendingImage(null);
    setInput("");
  };

  const isAssignmentMode = mode === "assignment";

  const sidebarContent = (
    <>
      <div className="space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Learning Mode</span>
        <LearningModeSelector mode={mode} onChange={(m) => { setMode(m); setSidebarOpen(false); }} />
      </div>

      <StatusPanel emotion={emotion} confidence={confidence} />

      <nav className="space-y-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tools</span>
        <SidebarLink to="/resume" icon={<FileText className="h-4 w-4" />} label="Resume Builder" />
      </nav>

      <button
        onClick={handleNewChat}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </button>

      {messages.length > 0 && (
        <button
          onClick={() => { handleNewChat(); setSidebarOpen(false); }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear History
        </button>
      )}

      <div className="flex-1" />

      <SessionSummary topics={topicsDiscussed} messageCount={messages.length} emotionJourney={emotionJourney} />
    </>
  );

  return (
    <div className="flex h-[100dvh] bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card p-5 gap-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">Saarthi AI</h1>
            <p className="text-xs text-muted-foreground">Your AI Learning Companion</p>
          </div>
        </div>
        {sidebarContent}
      </aside>

      {/* Main Chat */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center justify-between border-b border-border bg-card px-3 py-2.5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-5 flex flex-col gap-5">
                <SheetHeader className="p-0">
                  <SheetTitle className="flex items-center gap-2.5 text-left">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg">
                      S
                    </div>
                    <div>
                      <div className="font-display text-lg font-bold text-foreground leading-tight">Saarthi AI</div>
                      <p className="text-xs text-muted-foreground font-normal">Your AI Learning Companion</p>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                {sidebarContent}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold text-xs">
                S
              </div>
              <span className="font-display font-bold text-foreground text-sm truncate">Saarthi AI</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleNewChat}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="New chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Assignment mode banner */}
        {isAssignmentMode && (
          <div className="bg-accent/10 border-b border-accent/20 px-3 py-1.5 sm:px-4 sm:py-2 text-center">
            <span className="text-xs font-medium text-accent">📄 Assignment Mode — Formal academic answers. Export as PDF or Word.</span>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
          <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center pt-12 sm:pt-20 text-center px-2"
              >
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl sm:text-3xl mb-3 sm:mb-4">
                  {isAssignmentMode ? "📄" : "🎓"}
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {isAssignmentMode ? "Assignment Assistant" : "Welcome to Saarthi AI"}
                </h2>
                <p className="text-muted-foreground mb-4 max-w-md text-sm">
                  {isAssignmentMode
                    ? "Enter your assignment question and I'll generate a professor-friendly, structured answer you can export."
                    : "Ask me anything about any subject. I'll explain it step by step! You can also upload images."}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {isAssignmentMode ? (
                    <>
                      <button onClick={() => sendMessage("Explain Nanotechnology for an assignment")} className="rounded-xl bg-card px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-foreground shadow-card hover:shadow-elevated transition-shadow border border-border">
                        Explain Nanotechnology
                      </button>
                      <button onClick={() => sendMessage("Write an assignment on Object Oriented Programming concepts")} className="rounded-xl bg-card px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-foreground shadow-card hover:shadow-elevated transition-shadow border border-border">
                        OOP Concepts
                      </button>
                      <button onClick={() => sendMessage("Assignment on Applications of Machine Learning in Healthcare")} className="rounded-xl bg-card px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-foreground shadow-card hover:shadow-elevated transition-shadow border border-border">
                        ML in Healthcare
                      </button>
                    </>
                  ) : (
                    SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="rounded-xl bg-card px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-foreground shadow-card hover:shadow-elevated transition-shadow border border-border"
                      >
                        {s}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onSpeak={msg.role === "assistant" ? () => handleSpeak(msg.content) : undefined}
                isSpeaking={isSpeaking}
                showExport={isAssignmentMode && msg.role === "assistant" && msg.content.length > 50}
                onExport={handleExport}
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-chat-ai px-4 py-3 shadow-card">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pending image preview */}
        {pendingImage && (
          <div className="border-t border-border bg-card px-3 py-2 sm:px-4">
            <div className="mx-auto max-w-2xl flex items-center gap-2">
              <img src={pendingImage} alt="Upload preview" className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover border border-border" />
              <span className="text-xs text-muted-foreground flex-1">Image attached</span>
              <button onClick={() => setPendingImage(null)} className="text-xs text-destructive hover:underline">Remove</button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border bg-card px-2 py-2 sm:px-4 sm:py-3">
          <div className="mx-auto max-w-2xl flex gap-1.5 sm:gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />

            <button
              onClick={handleVoice}
              className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="Upload image"
            >
              <Image className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="Take photo"
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={
                isListening ? "Listening..." :
                pendingImage ? "Ask about this image..." :
                isAssignmentMode ? "Assignment question..." :
                "Ask any question..."
              }
              disabled={isLoading}
              className="flex-1 min-w-0 rounded-xl border border-input bg-background px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !pendingImage)}
              className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
