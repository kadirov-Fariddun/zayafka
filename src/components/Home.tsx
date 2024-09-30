import axios from "axios";
import React, { useEffect, useState } from "react";
import Cookie from 'js-cookie';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from 'react-slick';
import userPhoto from '../assets/user.webp';
const Home: React.FC = () => {
  // var settings = {
  //   dots: true,
  //   arrows:false,
  //   infinite: false,
  //   speed: 500,
  //   slidesToShow: 3,
  //   slidesToScroll: 4,
  //   rows:2,
  //   customPaging: function(i:number) {
  //     return <span className={`custom-dot`} key={i}></span>; // JSX для кастомных точек
  //   },
  //   // dotsClass: "slick-dots custom-dots", // Чтобы задать кастомные стили для точек

  //   responsive:[
  //     {
  //       breakpoint:1450,
  //       settings:{
  //         slidesToShow:4,
  //         slidesToScroll:3,
  //       }
  //     },
  //     {
  //       breakpoint:1280,
  //       settings:{
  //         slidesToShow:3,
  //         slidesToScroll:2,
  //       }
  //     },
  //     {
  //       breakpoint:900,
  //       settings:{
  //         slidesToShow:2,
  //         slidesToScroll:1,
  //       }
  //     },
  //     {
  //       breakpoint:600,
  //       settings:{
  //         slidesToShow:1,
  //         slidesToScroll:1,
  //         rows:2,
  //       }
  //     },
  //   ]
  // };
    
  type Player = {
    id:number,
    firstname:string,
    lastname:string,
    age:number,
    photo_url:string,
    team_name:string	
  }
  type User = {
    id:number,
    name:string,
    password:string,
    team_name:string,
    photo_url:string,
    phone_number:string
  }
  const [players,setPlayers] = useState<Player[]>([]);
  const [user,setUser] = useState<User|{}|null>({});
  const [firstname,setFirstname] = useState<string>('');
  const [lastname,setLastname] = useState<string>('');
  const [age,setAge] = useState<string>('');
  const [photo,setPhoto] = useState<File|null>(null);
  const [activeModal,setActiveModal] = useState<string>('');
  const [createPlayer,setCreatePlayer] = useState<boolean>(false);
  const [deletePlayer,setDeletePlayer] = useState<boolean>(false);
  // btn active 
  const [btnActive,setBtnActive] = useState<string>('');
  // получаем имя команды из куки 
  const userId = Cookie.get('userId');
  const UserTeamName = Cookie.get('auth');
  //URL 
  const url = 'http://localhost:5001/'
  // TOKEN
  const token = '5998034134:AAGaoApUgNL8HMsHMIpxfN2EtV2yOYodUK8';
  const getPlayers = async () => {
    try {
      const response = await axios.get(`${url}api/kubok-players/${UserTeamName}`);
      
      // Если нужно убедиться, что response.data — массив
      if (!Array.isArray(response.data)) {
        throw new Error('Неверный формат данных, ожидался массив');
      }
      
      return response.data;
    } catch (e: any) {
      console.log('Ошибка при получении игроков:', e.message);
      
      // Можно выбросить ошибку дальше для обработки в вызывающем коде
      throw e;
    }
  };
  // get User
  const getUser = async () => {
    try{
      const response = await axios.get(URL+'api/kubok-register/'+userId);
      return response.data;
    }
    catch(e:any){
      console.log('Ощибка при получении игроков',e.message);
      throw e;      
    }
  }
 

  useEffect(()=>{
    
    getPlayers()
    .then(res=>setPlayers(res))
    .catch(e=>console.log(e));
    // проверяем если есть юзер в локальном хранилиши то не делаем запрос иначе делаем
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      // Если пользователя нет в localStorage, делаем запрос
      getUser()
        .then(res => {
          if (res && res[0]) {
            const user = res[0];
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
          }
        })
        .catch(e => console.log(e));
    } else {
      // Если пользователь есть в localStorage, используем его
      const userObj = JSON.parse(savedUser);
      if (userObj) {
        setUser(userObj);
      } else {
        console.error('Error parsing user object');
      }
    }
   
  },[]);
  
  useEffect(()=>{
    if(firstname !== '' && lastname !== '' && age !== '' && photo !== null) return setBtnActive('active');
    else return setBtnActive('');
  },[firstname,lastname,photo,age]);
  

  const sendPhotoToTelegram = async (
    photo: File, 
    firstname: string, 
    lastname: string, 
    age: string, 
    UserTeamName: string,
    phone_number:string|any
  ): Promise<string> => {
    
    const formData = new FormData();
    formData.append('document', photo);  // Заменяем 'photo' на 'document' для отправки файла
  
    // Добавляем дополнительные данные как подпись (caption)
    const caption = `<b>Имя:</b> ${firstname}\n<b>Фамилия:</b> ${lastname}\n<b>Возраст:</b> ${age}\n<b>Команда:</b>${UserTeamName}\n<b>telefon raqam:</b> ${phone_number}`;
    formData.append('caption', caption); // Отправляем как подпись к файлу
    
    // Выполняем POST-запрос для отправки файла в Telegram
    const response = await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        chat_id: '@databasempliga',  // Замените на ваш chat_id
        parse_mode: 'HTML'  // Для форматирования текста в подписи
      }
    });
  
    // Возвращаем file_id для дальнейшего использования
    return response.data.result.document.file_id;
  };

  // получаем ID отправленного фото 
  const getFileUrl = async (file_id: string): Promise<string> => {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`);
    const filePath = response.data.result.file_path;
  
    // Возвращаем полную ссылку на файл
    return `https://api.telegram.org/file/bot${token}/${filePath}`;
  };
  // сохраняем все в базу данных
  const saveDataToMySQL = async (data: { firstname: string; lastname: string; photo_url: string; age: string,team_name:string}) => {
    const response = await axios.post(url + 'api/kubok-players/', data);
    return response.data;
  };

  // Общая функция который обьеденяет все функции
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Останавливаем стандартное поведение формы
  
    try {
      if (photo && UserTeamName) {
        // Отправляем фото в Telegram и получаем file_id
        let phone_number = user && 'phone_number' in  user && user.phone_number;
        const file_id = await sendPhotoToTelegram(photo,firstname,lastname,age,UserTeamName,phone_number);
  
        // Получаем URL файла по file_id
        const photoUrl = await getFileUrl(file_id);

        // Подготавливаем данные для сохранения в базе
        const data = {
          firstname,
          lastname,
          photo_url: photoUrl,
          age,
          team_name: UserTeamName, // Можно добавить другие поля, если нужно
        };
        console.log(data);
        
  
        // Сохраняем данные в MySQL
        await saveDataToMySQL(data);

        console.log("Данные успешно сохранены в базе данных!");
        // Обновляем страницу после успешного сохранения
        setCreatePlayer(true);
        setTimeout(()=>{
          window.location.reload();
        },1000)
        
      } else {
        console.error("Фото не выбрано");
      }
    } catch (error: any) {
      console.error("Ошибка:", error);
    }
  };


    const handleDelete = async (id: number) => {
      try {
        const response = await axios.delete(`${url}api/kubok-players/players/${id}`);
        if (response.status === 200) {
          console.log('Игрок успешно удалён');
          const indexPlayer = players.findIndex(p => p.id === id);

        setPlayers(prevPlayers => {
          // Удаляем игрока по индексу
          const updatedPlayers = [
            ...prevPlayers.slice(0, indexPlayer),   // Игроки до найденного индекса
            ...prevPlayers.slice(indexPlayer + 1)   // Игроки после найденного индекса
          ];
          setDeletePlayer(true);
          setTimeout(() => {
            setDeletePlayer(false);
          }, 1500);
          return updatedPlayers;
        });
          // Здесь можно добавить обновление состояния или сообщение об успехе

        }
      } catch (error) {
        console.error('Ошибка при удалении игрока', error);
      }
    };


  return (
    <>
    <div className="profile-warpper">
      <p className="top-lenght-teamList">Jamoa ro'yxati <span>{players.length} </span>kishidan iborat</p>
      {/* header */}
      <div className="header">
        <div className="header-left">
          <h1>{UserTeamName}</h1>
          {user&& 'name' in user && <p>{user.name}</p>}
        </div>
        <div className="header-right">
          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M17.707 12.293a.999.999 0 0 0-1.414 0l-1.594 1.594c-.739-.22-2.118-.72-2.992-1.594s-1.374-2.253-1.594-2.992l1.594-1.594a.999.999 0 0 0 0-1.414l-4-4a.999.999 0 0 0-1.414 0L3.581 5.005c-.38.38-.594.902-.586 1.435.023 1.424.4 6.37 4.298 10.268s8.844 4.274 10.269 4.298h.028c.528 0 1.027-.208 1.405-.586l2.712-2.712a.999.999 0 0 0 0-1.414l-4-4.001zm-.127 6.712c-1.248-.021-5.518-.356-8.873-3.712-3.366-3.366-3.692-7.651-3.712-8.874L7 4.414 9.586 7 8.293 8.293a1 1 0 0 0-.272.912c.024.115.611 2.842 2.271 4.502s4.387 2.247 4.502 2.271a.991.991 0 0 0 .912-.271L17 14.414 19.586 17l-2.006 2.005z"></path>
            </svg>
            {user && 'phone_number' in user && user.phone_number}
          </p>
        </div>
        
      </div>
      {/* header end */}
      {/* все футболисты */}
      <div className="players">
        <h2>Barcha futbolchilar</h2>
        {/* slider */}
        <div className="sliders">
        {/* <Slider {...settings} className="slider"> */}
          { players.length === 12 ? '':
          <div className="slide slide-btn" onClick={()=>setActiveModal('active-modal')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24">
                <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
              </svg>
              <span>Futbolchi qo'shish</span>
          </div>
          }
          {
            players.map((player)=>{

              return(
                <div className="slide" key={player.id}>
                  <div className="slide-head">
                    <p className="slide-head-age">Yosh: <span>{player.age}</span></p>
                    <button className="delete-btn" onClick={()=>handleDelete(player.id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="slide-image">
                    <img src={player.photo_url} alt="player-image" height={100} />
                  </div>
                  <div className="slide-name">{player.firstname+' '+player.lastname}</div>
                  <div className="slide-team_name">{player.team_name}</div>
                </div>
              )
            })
          }
        </div>
        {/* </Slider> */}
        {/* slider end */}
      </div>
      {/* все футболисты end */}
    </div>
    <div className={`form-add-player ${activeModal}`}>
      <button className="btn-close" onClick={()=>setActiveModal('')}>&times;</button>
      <form onSubmit={handleSubmit} >
              <div className="form-add-player-wrapper">
                <label className="image">
                  <img src={photo?URL.createObjectURL(photo):userPhoto} alt="sizning rasimingiz" />
                  <input type="file" name="photo" required onChange={(e)=>{
                    if(e.target.files && e.target.files[0]){
                      setPhoto(e.target.files[0]);
                    }
                  }}/>
                  <span>{photo === null?'Rasim yuklash':'Rasimni o\'zgartirish'}</span>
                </label>
                <label>
                  <p>Isim <span>*</span></p>
                  <input type="text" value={firstname} name="firstname" minLength={2} maxLength={50} required onChange={(e)=>{
                      let value = e.target.value 
                      value = e.target.value.replace(/[0-9]/g,'');
                      setFirstname(value);
                  }}/>
                </label>
                <label>
                  <p>Familiya <span>*</span></p>
                  <input type="text" value={lastname} name="lastname" minLength={2} maxLength={50} required onChange={(e)=>{
                    let value = e.target.value 
                    value = e.target.value.replace(/[0-9]/g,'');
                    setLastname(value);
                  }} />
                </label>
                <label>
                  <p>Yosh <span>*</span></p>
                  <input type="number" name="age" min={15} max={50} required onChange={(e)=>setAge(e.target.value)}/>
                </label>
                <button className={btnActive} type="submit">Saqlash</button>
              </div>
      </form>
      
    </div>
    {
      players.length === 12? '':
      <button className="add-player-btn" onClick={()=>setActiveModal('active-modal')}>
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24">
          <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path>
        </svg>
      </button>
    }
   
    {
      createPlayer ?
      <div className="top-loader">
          <div className="top-loading-bar"></div>
      </div>:''
    }
    {
      deletePlayer?
      <div className="delete-player active">Futbolchi o'chirib tashlandi</div>:
      <div className="delete-player">Futbolchi o'chirib tashlandi</div>
    }
    </>
  )
};

export default Home;