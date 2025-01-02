import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import ErrorMsg from "./common/ErrorMsg.tsx";

function App() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  return (
    <div>
      <ErrorMsg msg={errorMsg} setMsg={setErrorMsg}/>
      <div className="flex">
        <button onClick={() => {
          invoke("open_app", { name: 'config' })
            .catch(() => {
              setErrorMsg('')
            })
        }} className="default-button">Configuration
        </button>

      </div>
      <div className="flex items-center justify-center h-screen">
        <button
          onClick={() => {
            invoke("open_app", { name: 'ask' })
          }}
          className="default-button"
        >
          Search Helper
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
);
