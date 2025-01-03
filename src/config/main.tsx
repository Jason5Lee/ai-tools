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
  const [httpProxyEnabled, setHttpProxyEnabled] = useState(false);
  const [httpProxy, setHttpProxy] = useState('')
  const [openAiEnabled, setOpenAiEnabled] = useState(false);
  const [openAiApiKey, setOpenAiApiKey] = useState('')

  const setFromConfig = (conf: any)  => {
    console.log(JSON.stringify(conf))
    if (conf.httpProxy) {
      setHttpProxyEnabled(true)
      setHttpProxy(conf.httpProxy)
    }
    if (conf.openAiApiKey) {
      setOpenAiEnabled(true)
      setOpenAiApiKey(conf.openAiApiKey)
    }
  }

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <ErrorMsg msg={errorMsg} setMsg={setErrorMsg}/>
      <div className="space-y-2 mb-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={httpProxyEnabled}
            onChange={() => setHttpProxyEnabled(e => !e)}
            className="form-checkbox text-blue-600 dark:text-blue-400"
          />
          <span className="default-span">Enable HTTP Proxy</span>
        </label>
        <div className="flex items-center space-x-1">
          <label className="default-label">Proxy URL:</label>
          <input
            type="text"
            value={httpProxy}
            disabled={!httpProxyEnabled}
            className={httpProxyEnabled ? "configure-input" : "disabled-configure-input"}
            onChange={e => setHttpProxy(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={openAiEnabled}
            onChange={() => setOpenAiEnabled(e => !e)}
            className="form-checkbox text-blue-600 dark:text-blue-400"
          />
          <span className="default-span">Enable OpenAI</span>
        </label>
        <div className="flex items-center space-x-1">
          <label className="default-label">OpenAI API Key:</label>
          <input
            type="text"
            value={openAiApiKey}
            onChange={e => setOpenAiApiKey(e.target.value)}
            disabled={!openAiEnabled}
            className={openAiEnabled ? "configure-input" : "disabled-configure-input"}
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
                  openAiApiKey: openAiEnabled ? openAiApiKey : undefined,
                  httpProxy: httpProxyEnabled ? httpProxy : undefined,
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
