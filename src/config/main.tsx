import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import ErrorMsg from "../common/ErrorMsg.tsx";

function App() {
  useEffect(() => {
    invoke("set_window_title", { title: "AI Tools Configuration" })
    invoke('get_config')
      .then(setFromConfig)
  }, []);

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [openaiEnabled, setOpenaiEnabled] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('')

  const setFromConfig = (conf: any)  => {
    console.log(JSON.stringify(conf))
    if (conf.openaiApiKey) {
      setOpenaiEnabled(true)
      setOpenaiApiKey(conf.openaiApiKey)
    }
  }

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <ErrorMsg msg={errorMsg} setMsg={setErrorMsg}/>

      <div className="space-y-2 mb-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={openaiEnabled}
            onChange={() => setOpenaiEnabled(e => !e)}
            className="form-checkbox text-blue-600 dark:text-blue-400"
          />
          <span className="default-span">Enable OpenAI</span>
        </label>
        <div className="flex items-center space-x-1">
          <label className="default-label">OpenAI API Key:</label>
          <input
            type="text"
            value={openaiApiKey}
            onChange={e => setOpenaiApiKey(e.target.value)}
            disabled={!openaiEnabled}
            className={openaiEnabled ? "configure-input" : "disabled-configure-input"}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="default-button"
          onClick={() => {
            invoke(
              'save_config',
              {
                config: {
                  openaiApiKey: openaiEnabled ? openaiApiKey : undefined,
                }
              }
            )
              .then(setFromConfig)
              .catch(e => {
                console.log(e)
                setErrorMsg('Failed to save config')
              })
          }}
        >
          Save
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
