import { useState, useRef, useEffect } from "react";
import { Bot, Send, Leaf, Truck, Calculator, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

type Assistant = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
};

const assistants: Assistant[] = [
  {
    id: "eco-coach",
    name: "Eco-Coach NovaSystem",
    description: "Operaciones: ventas, inventario, pedidos, promociones",
    icon: Leaf,
    color: "text-[hsl(var(--module-inventory))]",
    bgColor: "bg-[hsl(var(--module-inventory-light))]",
  },
  {
    id: "eco-ops",
    name: "ECO-OPS",
    description: "Compras, auditoría proveedores, scoring, negociación",
    icon: Truck,
    color: "text-[hsl(var(--module-suppliers))]",
    bgColor: "bg-[hsl(var(--module-suppliers-light))]",
  },
  {
    id: "eco-fiscal",
    name: "Eco-Coach Fiscal",
    description: "Asesor fiscal: IVA, modelos 303/390, calendario fiscal",
    icon: Calculator,
    color: "text-[hsl(var(--module-accounting))]",
    bgColor: "bg-[hsl(var(--module-accounting-light))]",
  },
];

type Message = { role: "user" | "assistant"; content: string };

const Assistants = () => {
  const [activeAssistant, setActiveAssistant] = useState<Assistant>(assistants[0]);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversations[activeAssistant.id] ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setConversations((c) => ({ ...c, [activeAssistant.id]: newMessages }));
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { messages: newMessages, assistant: activeAssistant.id },
      });

      if (error) throw error;

      setConversations((c) => ({
        ...c,
        [activeAssistant.id]: [...newMessages, { role: "assistant", content: data.reply }],
      }));
    } catch (err: any) {
      setConversations((c) => ({
        ...c,
        [activeAssistant.id]: [
          ...newMessages,
          { role: "assistant", content: `Error: ${err.message ?? "No se pudo conectar con el asistente."}` },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Asistentes IA</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tres asistentes especializados para tu negocio ecológico
        </p>
      </div>

      {/* Assistant selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {assistants.map((a) => {
          const Icon = a.icon;
          const isActive = activeAssistant.id === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setActiveAssistant(a)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? `${a.bgColor} border-[hsl(var(--border))] shadow-sm`
                  : "bg-card hover:bg-accent border-transparent"
              }`}
            >
              <div className={`h-10 w-10 rounded-lg ${a.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${a.color}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {a.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{a.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat area */}
      <Card className="border shadow-sm">
        <CardContent className="p-0 flex flex-col h-[500px]">
          <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className={`h-14 w-14 rounded-2xl ${activeAssistant.bgColor} flex items-center justify-center mb-4`}>
                  <activeAssistant.icon className={`h-7 w-7 ${activeAssistant.color}`} />
                </div>
                <h3 className="font-medium text-foreground">{activeAssistant.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {activeAssistant.description}. Escribe tu pregunta para comenzar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-3 flex gap-2">
            <Textarea
              placeholder={`Pregunta a ${activeAssistant.name}…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="resize-none min-h-[40px] max-h-[120px]"
            />
            <Button onClick={sendMessage} disabled={!input.trim() || loading} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assistants;
