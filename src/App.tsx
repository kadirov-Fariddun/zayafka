import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Cookie from 'js-cookie';
import Form from './components/Form';
import Home from './components/Home';

function App() {
  // присваиваем функцию навигации
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем наличие куки 'auth'
    if (Cookie.get('auth')) {
      // Если куки есть, перенаправляем на главную
      const lsTeamName = Cookie.get('auth');
      navigate(`/user/${lsTeamName}`);
    } else {
      // Если куки нет, перенаправляем на страницу формы
      navigate('/form');
    }
  }, [navigate]); // Добавляем navigate как зависимость
  return (
    <Routes>
      <Route path='/form' element={<Form/>}/>
      <Route path='/user/:team' element={<Home/>}/>
    </Routes>
  )
}

export default App;
