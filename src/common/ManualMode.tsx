import { ManualModeState } from './index.ts'
import { useCallback, useState } from 'react'
import { error } from '@tauri-apps/plugin-log'

function ManualMode(
  { state, setState, setErrorMessage }:
  {
    state: ManualModeState | null
    setState: (oldState: ManualModeState | null) => void
    setErrorMessage: (errorMessage: string) => void
  },
) {
  if (!state) {
    return <></>
  }

  const [copied, setCopied] = useState(false)
  const copyPrompt = useCallback(() => {
    navigator.clipboard.writeText(state.prompt)
      .then(() => setCopied(true))
      .catch(err => {
        error('Failed to copy prompt: ' + err)
        setErrorMessage('Failed to copy prompt')
      })
  }, [state, setCopied, setErrorMessage])

  const pasteResult = useCallback(() => {
    navigator.clipboard.readText()
      .then(r => {
        state.onResult(r)
        state.onFinish()
        if (state.originalPosition !== null) {
          const top = state.originalPosition
          setTimeout(() =>
            window.scrollTo({ top }), 20)
        }
        setState(null)
        setCopied(false)
      })
      .catch(err => {
        error('Failed to paste the result: ' + err)
        setErrorMessage('Failed to paste the result')
      })
  }, [state, setState, setCopied, setErrorMessage])

  const cancel = useCallback(() => {
    state.onFinish()
    if (state.originalPosition !== null) {
      const top = state.originalPosition
      setTimeout(() =>
        window.scrollTo({ top }), 20)
    }
    setState(null)
    setCopied(false)
  }, [state, setState, setCopied])

  return <div className="p-4 border border-gray-300 rounded-md overflow-auto max-h-96 mb-4">
    <label className="text-lg font-semibold mb-2 default-label">Manual Mode: {state.actionDisplay}</label>
    <label className="default-label">First, click </label>
    <button className="default-button" onClick={copyPrompt}>Copy Prompt</button>
    <label className="default-label">{copied ? 'Copied!' : ''}</label>
    <label className="default-label">Then, run the prompt on the AI model then copy the response.</label>
    <label className="default-label">Finally, </label>
    <button className="default-button" onClick={pasteResult}>Paste the Result</button>
    <label className="default-label">Clich here to</label>
    <button className="mb-4 default-button" onClick={cancel}>Cancel</button>
  </div>
}

export default ManualMode
