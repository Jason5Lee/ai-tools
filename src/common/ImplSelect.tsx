import { Implementation } from "./index.ts";

function ImplSelect(
  { label, display, all, selectedIdent, setSelectedIdent }:
  {
    label: string
    display: Record<string, string>
    all: Implementation[] | undefined
    selectedIdent: string | undefined
    setSelectedIdent: (selectedIdent: string) => void
  }
) {
  if (selectedIdent === undefined && all !== undefined) {
    for (let i = 0; i < all.length; ++i) {
      if (all[i].available) {
        setSelectedIdent(all[i].ident)
        break
      }
    }
  }

  // Since `setStateFn` will only be called if the state is defined, we cast out the undefined case.
  return all && (<>
    <label className="default-label ml-2" htmlFor="impl-select">{label}</label>
    <select
      id="impl-select"
      className="ml-2 default-select"
      value={selectedIdent}
      onChange={e => {
        setSelectedIdent(e.target.value)
      }}
    >
      {...all.map(({ ident, available }) =>
        <option value={ident} className="default-option" disabled={!available}>{display[ident]}</option>)}
    </select>
  </>)
}

export default ImplSelect
