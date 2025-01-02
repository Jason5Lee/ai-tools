import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";

function App() {
  useEffect(() => {
    invoke("set_window_title", { title: "AI Tools Configuration" })
  }, []);

  const [httpProxyEnabled, setHttpProxyEnabled] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <div className="space-y-2 mb-6">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={httpProxyEnabled}
            onChange={() => setHttpProxyEnabled(!httpProxyEnabled)}
            className="form-checkbox text-blue-600 dark:text-blue-400"
          />
          <span className="default-span">Enable HTTP Proxy</span>
        </label>
        <div className="flex items-center space-x-1">
          <label className="w-20 text-gray-900 dark:text-gray-100">Proxy URL:</label>
          <input
            type="text"
            disabled={!httpProxyEnabled}
            className={httpProxyEnabled ? "configure-input" : "disabled-configure-input"}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <label className="inline-flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isCheckboxChecked}
            onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
            className="form-checkbox text-blue-600 dark:text-blue-400"
          />
          <span className="text-gray-900 dark:text-gray-100">Enable Input</span>
        </label>
        <input
          type="text"
          disabled={!isCheckboxChecked}
          className={`flex-1 form-input px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
            isCheckboxChecked
              ? 'bg-white dark:bg-gray-700 dark:text-gray-100'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
          } focus:outline-none focus:border-blue-500 dark:focus:border-blue-400`}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          className="px-6 py-2 bg-blue-600 text-white dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
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
