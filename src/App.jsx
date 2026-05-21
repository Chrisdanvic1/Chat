import "./App.css";
import Vector from "./assets/Vector.svg";
import Vector2 from "./assets/Vector2.svg";
import Vector3 from "./assets/Vector3.svg";
import img4 from "./assets/4.svg";
import img5 from "./assets/5.svg";
import img6 from "./assets/6.svg";
import img7 from "./assets/7.svg";
import { useRef, useState } from "react";
import OpenAI from "openai";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true,
  });

  const handleInput = () => {
    const el = textareaRef.current;

    el.style.height = "auto"; // reset first
    el.style.height = Math.min(el.scrollHeight, 200) + "px"; // cap at 200px

    el.style.overflowY = el.scrollHeight > 200 ? "auto" : "hidden";
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input,
    };

    // show user message instantly
    setMessages((prev) => [...prev, userMessage]);

    // clear textarea
    setInput("");

    // loading starts
    setLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          ...messages.map((msg) => ({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.text,
          })),
          {
            role: "user",
            content: input,
          },
        ],
      });
      console.log(response);
      const aiText = response.choices[0].message.content;

      const aiMessage = {
        role: "assistant",
        text: aiText,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log("FULL ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: error.message,
        },
      ]);
    }

    setLoading(false);
  };
  console.log(import.meta.env.VITE_OPENAI_API_KEY);

  return (
    <>
      <header className="flex items-center justify-between my-2 mx-6 text-lg sticky top-0 h-dvh">
        <div className="flex items-center justify-center gap-4">
          <img src={Vector} className="w-4" alt="edit" />
          <div className="flex items-center justify-center gap-2 cursor-pointer px-3 py-2 rounded-xl hover:bg-[hsl(0,0%,97%)]">
            <p className="font-semibold text-2xl">ChatGPT</p>
            <img src={Vector2} className="w-3" alt="arrow-down" />
          </div>
        </div>

        <div className={`items-center justify-center gap-2 ${
              messages.length > 0
                ? "hidden"
                : "flex"
            }`}>
          <button className="bg-black w-25 text-white px-3 py-1 rounded-full cursor-pointer hover:bg-[hsl(0,0%,30%)]">
            Log in
          </button>
          <button className="border w-25 px-3 py-1 rounded-full hover:bg-[hsl(0,0%,97%)] cursor-pointer">
            Sign up
          </button>
          <img src={Vector3} className="w-4" alt="info" />
        </div>
      </header>

      <main className="flex flex-col h-screen items-center  h-dvh">
        <section className="w-200">
          {messages.length === 0 && (
            <p className="text-5xl font-semibold text-center mt-70">
              What can I help with?
            </p>
          )}

          <div
            className={`px-4 mt-10 text-xl w-full shadow-[0_10px_20px_-12px_rgba(0,0,0,0.6)] rounded-b-3xl p-3 max-w-3xl mx-auto ${
              messages.length > 0
                ? "fixed bottom-6 left-1/2 -translate-x-1/2"
                : "relative mt-10"
            }`}
          >
            {/* ✅ FIXED TEXTAREA */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onInput={handleInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={1}
              placeholder="Ask anything..."
              className="w-full bg-transparent outline-none resize-none overflow-y-auto"
            />

            <div className="flex items-center justify-between mt-5">
              <div className="flex gap-6 flex-1">
                <div className="flex items-center justify-center border border-[hsl(0,0%,50%)] rounded-full px-3 gap-1 cursor-pointer hover:bg-[hsl(0,0%,97%)]">
                  <img src={img4} className="w-3" alt="" />
                  Attach
                </div>

                <div className="flex items-center justify-center border border-[hsl(0,0%,50%)] rounded-full px-3 gap-1 cursor-pointer hover:bg-[hsl(0,0%,97%)]">
                  <img src={img5} alt="" className="w-3" />
                  Search
                </div>

                <div className="flex items-center justify-center border border-[hsl(0,0%,50%)] rounded-full px-3 gap-1 cursor-pointer hover:bg-[hsl(0,0%,97%)]">
                  <img src={img6} alt="" className="w-3" />
                  Reason
                </div>
              </div>

              <div
                onClick={sendMessage}
                className="flex items-center justify-center bg-black p-2 rounded-full cursor-pointer hover:bg-[hsl(0,0%,20%)]"
              >
                <img
                  src={img7}
                  alt=""
                  className="w-4 h-4 flex items-center justify-center"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-40">
            <div className="mt-10 space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-zinc-200 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            {loading && (
              <div className="flex justify-start mt-4">
                <div className="bg-zinc-200 text-black px-4 py-2 rounded-2xl">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
