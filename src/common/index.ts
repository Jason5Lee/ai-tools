import { invoke, Channel } from "@tauri-apps/api/core";
import { error } from '@tauri-apps/plugin-log';

export interface Implementation {
  ident: string
  available?: boolean
}

export function getAllImplementations(
  app: string, name: string,
  setAllImplementations: (state: Implementation[]) => void,
  setError: (error: string) => void,
): void {
  invoke<Implementation[]>(app + '_get_implementations', { action: name })
    .then(all => setAllImplementations(all))
    .catch(err => {
      error(`Failed to get implementations in ${app} of ${name}: ${err}`)
      setError(`Failed to get implementations of ${name}`)
    })
}

export interface ManualModeState {
  actionDisplay: string
  prompt: string
  originalPosition: number | null
  onResult: (result: string) => void
  onFinish: () => void
}

export function runAction(
  {
    app, action, ident, actionDisplay, manualModeElement,
    setErrorMessage, setManualModeState, setResult, onFinish,
  }: {
    app: string; action: any; ident: string; actionDisplay: string;
    manualModeElement: HTMLDivElement | null;
    setErrorMessage: (error: string) => void;
    setManualModeState: (newState: ManualModeState) => void;
    setResult: (result: string) => void;
    onFinish: () => void;
  }): void {
  const response = new Channel<string>()
  let result = ''
  response.onmessage = (msg) => {
    result += msg
    setResult(result)
  }

  invoke(app + '_run_action', { action, ident, response })
    .then((manual: any) => {
      if (manual?.prompt) {
        let originalPosition: number | null = null
        if (manualModeElement !== null) {
          originalPosition = window.scrollY
          manualModeElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }

        setManualModeState({
          actionDisplay,
          onResult: setResult,
          prompt: manual.prompt,
          originalPosition,
          onFinish,
        })
      } else {
        onFinish()
      }
    })
    .catch(err => {
      error(`Failed to run prompt ${ident} in ${app}: ${err}`)
      setErrorMessage(`Failed to run prompt ${ident}`)
    })
}
