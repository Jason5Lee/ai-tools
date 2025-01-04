import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import ImplSelect from "../common/ImplSelect.tsx";
import { Implementation, ManualModeState, getAllImplementations, runAction } from "../common";
import ErrorMsg from "../common/ErrorMsg.tsx";
import ManualMode from "../common/ManualMode"

const rewriteImplDisplay: Record<string, string> = {
  GENERAL_MANUAL: 'Manual - General',
  OPENAI_4o_MINI: 'OpenAI 4o Mini',
  OPENAI_4o: 'OpenAI 4o',
  OPENAI_4_TURBO: 'OpenAI GPT-4 Turbo',
}

const genSearchImplDisplay: Record<string, string> = {
  GENERAL_MANUAL: 'Manual - General',
  OPENAI_4o: 'OpenAI 4o',
  OPENAI_4_TURBO: 'OpenAI GPT-4 Turbo',
  OPENAI_o1_MINI: 'OpenAI o1 Mini',
  OPENAI_o1_PREVIEW: 'OpenAI o1 Preview',
}

const askImplDisplay: Record<string, string> = {
  GENERAL_MANUAL: 'Manual - General',
  OPENAI_4o: 'OpenAI 4o',
  OPENAI_4_TURBO: 'OpenAI GPT-4 Turbo',
  OPENAI_o1_MINI: 'OpenAI o1 Mini',
  OPENAI_o1_PREVIEW: 'OpenAI o1 Preview',
}

const app = 'ask'

function App() {
  useEffect(() => {
    invoke("set_window_title", { title: "AI Tools - Ask" })
  }, [])

  const manualModeRef = useRef<HTMLDivElement>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [searchSectionOpen, setSearchSectionOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [materialText, setMaterialText] = useState('');
  const [question, setQuestion] = useState('')
  const [rewrittenQuestion, setRewrittenQuestion] = useState('')

  const [rewriteInProgress, setRewriteInProgress] = useState(false)
  const [allRewriteImpls, setAllRewriteImpls] = useState<Implementation[] | undefined>(undefined)
  const [selectedRewriteImplIdent, setSelectedRewriteImplIdent] = useState<string | undefined>(undefined)
  const rewriteDisabled = rewriteInProgress || selectedRewriteImplIdent === undefined

  const [genSearchInProgress, setGenSearchInProgress] = useState(false)
  const [allGenSearchImpls, setAllGenSearchImpls] = useState<Implementation[] | undefined>(undefined)
  const [selectedGenSearchImplIdent, setSelectedGenSearchImplIdent] = useState<string | undefined>(undefined)
  const genSearchDisabled = genSearchInProgress || selectedGenSearchImplIdent === undefined

  const [askInProgress, setAskInProgress] = useState(false)
  const [allAskImpls, setAllAskImpls] = useState<Implementation[] | undefined>(undefined)
  const [selectedAskImplIdent, setSelectedAskImplIdent] = useState<string | undefined>(undefined)
  const askDisabled = askInProgress || selectedAskImplIdent === undefined

  console.log(askInProgress + ', ' + (askInProgress || selectedAskImplIdent === undefined))
  const [manualModeState, setManualModeState] = useState<ManualModeState | null>(null)
  const [answer, setAnswer] = useState('')

  const getQuestion = () => {
    if (!rewrittenQuestion) {
      setRewrittenQuestion(question)
      return question
    }
    return rewrittenQuestion
  }

  useEffect(() => {
    getAllImplementations(app, 'rewrite', setAllRewriteImpls, setErrorMsg)
    getAllImplementations(app, 'genSearch', setAllGenSearchImpls, setErrorMsg)
    getAllImplementations(app, 'ask', setAllAskImpls, setErrorMsg)
  }, []);

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <ErrorMsg msg={errorMsg} setMsg={setErrorMsg}/>
      {/* Select Implementation */}
      <div className="flex items-center mb-4">
        <ImplSelect label="Rewrite" display={rewriteImplDisplay} all={allRewriteImpls}
                    selectedIdent={selectedRewriteImplIdent} setSelectedIdent={setSelectedRewriteImplIdent}/>
        <ImplSelect label="Generate Search" display={genSearchImplDisplay} all={allGenSearchImpls}
                    selectedIdent={selectedGenSearchImplIdent} setSelectedIdent={setSelectedGenSearchImplIdent}/>
      </div>
      <div className="flex items-center mb-4">
        <ImplSelect label="Answer" display={askImplDisplay} all={allAskImpls}
                    selectedIdent={selectedAskImplIdent} setSelectedIdent={setSelectedAskImplIdent}/>
      </div>

      {/* Manual Mode */}
      <div ref={manualModeRef}></div>
      <ManualMode state={manualModeState} setState={setManualModeState} setErrorMessage={setErrorMsg}/>
      {/* Question Input */}
      <div className="flex items-center mb-4">
        <textarea
          value={question}
          onChange={(e: React.ChangeEvent<{ value: string }>) => setQuestion(e.target.value)}
          placeholder="Question ..."
          className="default-textarea"
          rows={1}
        />
        <button
          disabled={rewriteDisabled}
          className={rewriteDisabled ? "ml-2 default-disabled-button" : "ml-2 default-button"}
          onClick={() => {
            setRewriteInProgress(true)
            runAction(
              {
                app, action: { name: 'rewrite', question },
                ident: selectedRewriteImplIdent!,
                actionDisplay: 'Rewrite', manualModeElement: manualModeRef.current,
                setErrorMessage: setErrorMsg, setManualModeState,
                setResult: setRewrittenQuestion,
                onFinish: () => setRewriteInProgress(false)
              })
          }}
        >Rewrite
        </button>
      </div>

      <div className="flex items-center mb-4">
        <textarea
          value={rewrittenQuestion}
          onChange={(e: React.ChangeEvent<{ value: string }>) => setRewrittenQuestion(e.target.value)}
          placeholder="Rewritten Question ..."
          className="default-textarea"
          rows={1}
        />
      </div>

      {/* Search Section */}
      <div className="mb-4">
        <label
          onClick={() => {
            setSearchSectionOpen(prev => !prev);
          }}
          className="cursor-pointer text-lg font-semibold mb-2 default-label"
        >
          {searchSectionOpen ? '-' : '+'} Search Section
        </label>
        {searchSectionOpen && (
          <>
            <button
              disabled={genSearchDisabled}
              className={genSearchDisabled ? "default-disabled-button mb-4" : "default-button mb-4"}
              onClick={() => {
                setGenSearchInProgress(true)
                runAction(
                  {
                    app, action: { name: 'genSearch', question: getQuestion() },
                    ident: selectedGenSearchImplIdent!,
                    actionDisplay: 'Generate Search', manualModeElement: manualModeRef.current,
                    setErrorMessage: setErrorMsg, setManualModeState,
                    setResult: setSearch,
                    onFinish: () => setGenSearchInProgress(false),
                  })
              }}
            >Generate Search Keyword
            </button>
            {search && (<div className="p-4 border border-gray-300 rounded-md overflow-auto max-h-96 mb-4">
              <p className="default-paragraph whitespace-pre-line">
                {search}
              </p>
            </div>)}

            <textarea
              value={materialText}
              onChange={(e: React.ChangeEvent<{ value: string }>) => setMaterialText(e.target.value)}
              placeholder="Material ..."
              className="default-textarea"
              rows={5}
            />
          </>
        )}
      </div>

      {/* Answer Button */}
      <div className="mb-4">
        <button
          disabled={askDisabled}
          className={askDisabled ? "default-disabled-green-button" : "default-green-button"}
          onClick={() => {
            setAskInProgress(true)
            runAction(
              {
                app, ident: selectedAskImplIdent!,
                action: {
                  name: 'ask',
                  question: getQuestion(),
                  material: materialText === '' ? undefined : materialText
                },
                actionDisplay: 'Ask', manualModeElement: manualModeRef.current,
                setErrorMessage: setErrorMsg, setManualModeState,
                setResult: setAnswer,
                onFinish: () => setAskInProgress(false),
              })
          }}
        >Ask
        </button>
      </div>

      {/* Long Text Display */}
      <div className="p-4 border border-gray-300 rounded-md overflow-auto max-h-96 mb-4">
        <p className="default-paragraph whitespace-pre-line">
          {answer}
        </p>
      </div>
      <button className='default-button' onClick={() => navigator.clipboard.writeText(answer)}>Copy</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
);
