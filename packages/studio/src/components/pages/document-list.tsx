import { useParams } from "react-router-dom"

export function DocumentList() {

  const { document } = useParams()

  const validTypes = ['posts', 'authors', 'home', 'settings']

  if (!validTypes.includes(document!)) {
    return <div>Invalid document type</div>
  }

  return <div>Document List for {document}</div>
}
