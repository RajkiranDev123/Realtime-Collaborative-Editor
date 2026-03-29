import { useState } from "react";
import { Editor } from "@monaco-editor/react";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

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
            height={"100%"}
            defaultLanguage="javascript"
            defaultValue="//some comment"
            theme="vs-dark"
          />
        </section>
      </main>
    </>
  );
}

export default App;
