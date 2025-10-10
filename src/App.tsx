import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Footer from './components/Footer'
import './App.css'

const imgAlt = "El Agave logo";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className='text-center'>
        <div className="flex flex-col justify-center items-center md:flex-row md:justify-evenly p-8">
          <h1 className='flex items-center mt-6 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white md:order-1'>
            <span>Condominio El Agave</span>
            <img
              className="md:mt-0 mx-2"
              src="/logo_el_agave.png"
              alt={imgAlt}
              width={60}
              height={60}
            />
          </h1>
          <img
            className="rounded-full mt-3 md:mt-0"
            src="/el-agave-1.png"
            alt={imgAlt}
            width={250}
            height={250}
          />
        </div>
      </div>
      {children}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
