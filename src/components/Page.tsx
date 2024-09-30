import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookie from 'js-cookie';

const Page = () => {
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
    <div>Page</div>
  )
};

export default Page;