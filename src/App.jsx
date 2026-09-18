import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Judges from './pages/Judges'
import Participants from './pages/Participants'
import Judging from './pages/Judging'
import Results from './pages/Results'
import Vendors from './pages/Vendors'
import Mementos from './pages/Mementos'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/judges" element={<Judges />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/judging" element={<Judging />} />
          <Route path="/results" element={<Results />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/mementos" element={<Mementos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
