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
  onResult: (result: string) => void
}

const MANUAL_PREFIX = 'manual:'
const RESPONSE_PREFIX = 'res:'

export function runAction(
  app: string, action: any, ident: string, actionDisplay: string,
  { setErrorMessage, setManualModeState, appendResult }:
  {
    setErrorMessage: (error: string) => void
    setManualModeState: (newState: ManualModeState) => void
    appendResult: (result: string) => void
  }
): void {
  const response = new Channel<string>()
  let first = true
  response.onmessage = msg => {
    if (first) {
      if (msg.startsWith(MANUAL_PREFIX)) {
        setManualModeState({
          actionDisplay,
          onResult: appendResult,
          prompt: msg.substring(MANUAL_PREFIX.length),
        })
      } else if (msg.startsWith(RESPONSE_PREFIX)) {
        first = false
        appendResult(msg.substring(RESPONSE_PREFIX.length))
      }
    } else {
      appendResult(msg)
    }
  }

  invoke(app + '_run_action', { action, ident, response })
    .catch(err => {
      error(`Failed to run prompt ${ident} in ${app}: ${err}`)
      setErrorMessage(`Failed to run prompt ${ident}`)
    })
}
