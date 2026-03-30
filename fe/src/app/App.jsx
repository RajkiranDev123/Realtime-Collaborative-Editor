import { useRef, useState, useMemo } from "react";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs"; // internal engine
import { MonacoBinding } from "y-monaco"; //Monaco Editor & Yjs = shared data (CRDT) , MonacoBinding connects both
import { SocketIOProvider } from "y-socket.io"; // y-socket.io = communication + smart collaboration (Yjs)
// Socket.IO = just communication
// y = just a name (from Yjs ecosystem) :
// whole ecosystem of tools to make real-time collaboration easy.
// The “brain” of the system
// Provides:
// Shared documents
// Conflict-free merges (CRDT)
// Maps, Arrays, Text for collaborative editing

import "./App.css";

function App() {
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const editorRef = useRef(null);

  const ydoc = useMemo(() => new Y.Doc(), []); // all codes are stored here , Keeping all changes in a single ydoc object
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);
  // React re-renders frequently , Yjs objects must persist across renders , useMemo keeps ydoc and yText references stable
  // If you don’t use useMemo, your editor resets on every render, and collaboration breaks.

  const handleMount = (editor) => {
    editorRef.current = editor;

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      {
        autoConnect: true,
      },
    );
    const monacoBinding = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness,
    );
  };

  const handleJoin = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
    window.history.pushState({}, "", "?username=" + e.target.username.value);
  };

  if (!username) {
    return (
      <>
        <main className="h-screen w-full bg-gray-900 flex items-center justify-center p-4">
          <form
            onSubmit={handleJoin}
            className="flex flex-col gap-4 p-6 bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            <p className="text-gray-300 text-lg font-semibold text-center">
              Real-Time Collaborative Editor
            </p>
            <input
              type="text"
              placeholder="Enter your name..."
              name="username"
              className="p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
            {!username && <p className="text-sm text-white">* Name is mandatory for joining!</p>}
            <button className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold hover:from-teal-500 hover:to-blue-600 transition-colors shadow-md">
              Join
            </button>
          </form>
        </main>
      </>
    );
  }

  return (
    <>
      {/*   overflow-hidden : Hide anything that goes outside the element’s box , Image/etc stays inside border radius.
       */}
      {/* w-1/4 is 25 % and 3/4 is 75 % */}
      <main className="h-screen w-full bg-gray-950 text-white flex gap-4 p-4">
        <aside className="h-full w-1/4 bg-amber-50 rounded-lg"></aside>
        {/* section */}
        <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
          <Editor
            ref={editorRef}
            height={"100%"}
            defaultLanguage="javascript"
            defaultValue="//some comment"
            theme="vs-dark"
            onMount={handleMount}
          />
        </section>
      </main>
    </>
  );
}

export default App;
