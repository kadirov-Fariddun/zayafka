// import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
// import { useNavigate } from "react-router-dom";
// import Cookie from 'js-cookie';
import Form from './components/Form';
import Home from './components/Home';
import Page from './components/Page';
function App() {

  return (
    <Routes>
      <Route path='/' element={<Page/>}/>
      <Route path='/form' element={<Form/>}/>
      <Route path='/user/:team' element={<Home/>}/>
    </Routes>
  )
}

export default App;
