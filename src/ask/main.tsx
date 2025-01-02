import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import ImplSelect from "../common/ImplSelect.tsx";
import { Implementation, ManualModeState, getAllImplementations, runAction } from "../common";
import ErrorMsg from "../common/ErrorMsg.tsx";
import ManualMode from "../common/ManualMode"

const rewriteImplDisplay: Record<string, string> = {
  GENERAL_MANUAL: 'Manual - General'
}

const genSearchImplDisplay: Record<string, string> = {
  GENERAL_MANUAL: 'Manual - General'
}

const answerImplDisplay: Record<string, string> = {
  GENERAL_MANUAL: 'Manual - General'
}

const app = 'ask'

function App() {
  useEffect(() => {
    invoke("set_window_title", { title: "AI Tools - Ask" })
  }, [])

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [searchSectionOpen, setSearchSectionOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [materialText, setMaterialText] = useState('');
  const [question, setQuestion] = useState('')
  const [rewrittenQuestion, setRewrittenQuestion] = useState('')

  const [allRewriteImpls, setAllRewriteImpls] = useState<Implementation[] | undefined>(undefined)
  const [selectedRewriteImplIdent, setSelectedRewriteImplIdent] = useState<string | undefined>(undefined)
  const [allGenSearchImpls, setAllGenSearchImpls] = useState<Implementation[] | undefined>(undefined)
  const [selectedGenSearchImplIdent, setSelectedGenSearchImplIdent] = useState<string | undefined>(undefined)
  const [allAnswerImpls, setAllAnswerImpls] = useState<Implementation[] | undefined>(undefined)
  const [selectedAnswerImplIdent, setSelectedAnswerImplIdent] = useState<string | undefined>(undefined)

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
    getAllImplementations(app, 'ask', setAllAnswerImpls, setErrorMsg)
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
        <ImplSelect label="Answer" display={answerImplDisplay} all={allAnswerImpls}
                    selectedIdent={selectedAnswerImplIdent} setSelectedIdent={setSelectedAnswerImplIdent}/>
      </div>

      {/* Manual Mode */}
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
          disabled={selectedRewriteImplIdent === undefined}
          className="ml-2 default-button"
          onClick={() => runAction(
            app, { name: 'rewrite', question },
            selectedRewriteImplIdent!, 'Rewrite',
            {
              setErrorMessage: setErrorMsg, setManualModeState,
              appendResult: (r) => setRewrittenQuestion(q => q + r)
            })}
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
              disabled={selectedGenSearchImplIdent === undefined}
              className="default-button mb-4"
              onClick={() => runAction(app, { name: 'genSearch', question: getQuestion() },
                selectedGenSearchImplIdent!, 'Generate Search',
                {
                  setErrorMessage: setErrorMsg, setManualModeState,
                  appendResult: (r) => setSearch(q => q + r)
                })}
            >Generate Search Keyword
            </button>
            {search && (<div className="p-4 border border-gray-300 rounded-md overflow-auto max-h-96 mb-4">
              <p className="default-paragraph whitespace-pre-line">
                {search}
              </p>
            </div>)}
            {/*<div className="flex items-center mb-4">*/}
            {/*  <textarea*/}
            {/*    value={search}*/}
            {/*    onChange={(e: React.ChangeEvent<{ value: string }>) => setSearch(e.target.value)}*/}
            {/*    placeholder="Search ..."*/}
            {/*    className="default-textarea"*/}
            {/*    rows={5}*/}
            {/*  />*/}
            {/*  /!*<button className="ml-2 default-button">Search</button>*!/*/}

            {/*</div>*/}
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
          disabled={selectedAnswerImplIdent === undefined}
          className="default-green-button"
          onClick={() => runAction(app, {
              name: 'ask',
              question: getQuestion(),
              material: materialText === '' ? undefined : materialText
            },
            selectedAnswerImplIdent!, 'Ask',
            {
              setErrorMessage: setErrorMsg, setManualModeState,
              appendResult: (r) => setAnswer(q => q + r)
            })}
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
