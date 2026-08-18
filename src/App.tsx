import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Apply from './pages/Apply'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing locale="ko" />} />
        <Route path="/en" element={<Landing locale="en" />} />
        <Route path="/apply" element={<Apply locale="ko" />} />
        <Route path="/en/apply" element={<Apply locale="en" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
