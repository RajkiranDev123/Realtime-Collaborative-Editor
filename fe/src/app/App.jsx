import { useRef, useState, useMemo, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { SocketIOProvider } from "y-socket.io";

import "./App.css";

function App() {
  // --- HOOKS ---
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile toggle
  const editorRef = useRef(null);

  // Yjs document (persistent across renders)
  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  // --- EFFECT: Real-time collaboration ---
  useEffect(() => {
    if (!username) return;

    const provider = new SocketIOProvider(
      import.meta.env.VITE_API_URL,
      "monaco",
      ydoc,
      { autoConnect: true },
    );

    provider.awareness.setLocalStateField("user", { username });

    // Helper to update users list
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      setUsers(
        states
          .filter((state) => state.user && state.user.username)
          .map((state) => state.user),
      );
    };

    updateUsers(); // initial set
    provider.awareness.on("change", updateUsers);

    // Clean up on page unload
    const handleBeforeUnload = () => {
      provider.awareness.setLocalStateField("user", null);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      provider.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [username, ydoc]);

  // --- HANDLERS ---
  const handleJoin = (e) => {
    e.preventDefault();
    const name = e.target.username.value.trim();
    if (!name) return;
    setUsername(name);
    window.history.pushState({}, "", "?username=" + name);
  };

  const handleMount = (editor) => {
    editorRef.current = editor;
    new MonacoBinding(yText, editor.getModel(), new Set([editor]));
  };

  // --- CONDITIONAL UI: Join Form ---
  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-900 flex items-center justify-center p-4">
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4 p-6 bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg 
          transform transition-all duration-300 hover:scale-105"
        >
          <p className="text-gray-300 text-lg font-semibold text-center">
            Real-Time Collaborative Editor
          </p>
          <input
            type="text"
            placeholder="Enter your name..."
            name="username"
            className="p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2
             focus:ring-blue-500 focus:outline-none transition-all"
          />
          <button
            className="p-3 mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-teal-500 text-white 
          font-bold hover:from-teal-500 hover:to-blue-600 transition-colors shadow-md"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  // --- MAIN APP UI ---
  return (
    <main className="h-screen w-full bg-gray-950 text-white flex flex-col md:flex-row gap-4 p-4">
      {/* Mobile toggle button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          className="flex items-center space-x-1 px-2  bg-gradient-to-r from-blue-600 to-teal-500 text-sm
               text-white font-semibold rounded-md shadow-lg hover:scale-105 transform transition-all"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <>
              <span>Hide Users</span>
            </>
          ) : (
            <>
              <span>Show Users</span>
            </>
          )}
        </button>
      </div>

      {/* Sidebar */}
      {(sidebarOpen || window.innerWidth >= 768) && (
        <aside className="h-full w-full md:w-1/4 bg-white shadow-md rounded-xl border border-gray-200 mb-4 md:mb-0 transition-all">
          <h2 className="text-xl font-semibold text-gray-800 px-4 py-3 border-b border-gray-200">
            Users
          </h2>
          <ul className="p-4 space-y-3">
            {users.map((user, index) => (
              <li
                key={index}
                className="flex items-center p-3 bg-gray-100 text-gray-800 rounded-lg
                   hover:bg-gray-200 transition-colors duration-200"
              >
                <span
                  className="inline-flex items-center justify-center w-7 h-7 bg-blue-500
                   text-white rounded-full mr-3 font-medium text-sm"
                >
                  {user.username[0].toUpperCase()}
                </span>
                {user.username}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Editor */}
      <section className="w-full md:w-3/4 bg-neutral-800 rounded-lg overflow-hidden flex-1">
        <Editor
          ref={editorRef}
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start coding..."
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;
