import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import BinaryTreePage from './modules/BinaryTree/BinaryTreePage'
import BSTPage from './modules/BST/BSTPage'
import AVLPage from './modules/AVL/AVLPage'
import RBTPage from './modules/RBT/RBTPage'
import DictionaryPage from './modules/Dictionary/DictionaryPage'
import GraphPage from './modules/Graph/GraphPage'
import HeapPage from './modules/Heap/HeapPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/arboles-binarios" element={<BinaryTreePage />} />
          <Route path="/abb" element={<BSTPage />} />
          <Route path="/avl" element={<AVLPage />} />
          <Route path="/arn" element={<RBTPage />} />
          <Route path="/diccionarios" element={<DictionaryPage />} />
          <Route path="/grafos" element={<GraphPage />} />
          <Route path="/monticulos" element={<HeapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
