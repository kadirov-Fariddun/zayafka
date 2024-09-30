import { useEffect, useState } from "react";
import IMask from 'imask';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookie from 'js-cookie';

const Form = () => {
    type User = {
        name: string;
        team_name: string;
        phone_number: string;
        password: string;
    };
    const [register,setRegister] = useState<boolean>(true);
    const [formLoader,setFormLoader] = useState<boolean>(false);
    const [inputFocus,setInputFocus] = useState<number>(0);
    // активитруем видимость пароля или нет 
    const [passwordSee,setPasswordSee] = useState<boolean>(true);
    // проверяем успешно ли сохранился пользователь или нет 
    const [createUser,setCreateUser] = useState<boolean|null>(null);
    // users 
    const [users,setUsers] = useState<User[]>([]);
    // error have a user
    const [errorHaveUser,setErrorHaveUser] = useState<boolean>(false);
    // нужные данные для авторизации 
    const [name,setName] = useState<string>('');
    const [teamName,setTeamName] = useState<string>('');
    const [password,setPassword] = useState<string>('');
    //подверждаем что юзер зашел в свой кабинет 
    const [agreeDataUser,setAgreeDataUser] = useState<string>('');
    //URL
    const URL = 'http://localhost:5001/'; 
    const navigate = useNavigate();
    // POST request for register user
    const postRequest = async () => {
    
        const name = document.querySelector('[name="name"]') as HTMLInputElement | null;
        const team_name = document.querySelector('[name="team-name"]') as HTMLInputElement | null;
        const phone_number = document.querySelector('[name="phone"]') as HTMLInputElement | null;
        const password = document.querySelector('[name="password"]') as HTMLInputElement | null;
        const password_verificate = document.querySelector('[name="password-verificate"]') as HTMLInputElement | null;
    
        // Проверка на null
        if (!name || !team_name || !phone_number || !password || !password_verificate) {
            console.error('Один или несколько элементов не найдены');
            return;
        }
    
        if (password.value === password_verificate.value) {
            const resultObj: User = {
                name: name.value,
                team_name: team_name.value,
                phone_number: phone_number.value,
                password: password.value
            };
            const checkUser: User | undefined = users.find(u => u.team_name.toLowerCase() === team_name.value.toLowerCase());
            if(checkUser && checkUser.team_name){
                setTimeout(() => {
                    setErrorHaveUser(true);
                }, 1000);
            }else{
                try {
                    const res = await axios.post(URL+'api/kubok-register/', resultObj);
                    setErrorHaveUser(false);
                    setTimeout(() => {
                        setCreateUser(true);
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }, 1000);
                    console.log('Данные для отправки:', resultObj);
                    return res.data;
                } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                        console.log('Данные для отправки:', resultObj);
                        console.error('Ошибка при POST запросе kubok-register:', error.response?.data);
                        console.error('Код состояния:', error.response?.status);
                    } else {
                        console.error('Неизвестная ошибка:', error);
                    }
                    throw error; // Пробрасываем ошибку дальше, если нужно
                }
            }
    
            
        } else {
            console.error('Пароли не совпадают');
            setTimeout(() => {
                setCreateUser(false);
                setErrorHaveUser(false);
            }, 1000);
        }
    
        return;
    };


    // получаем всех пользователей 
    const getUsers = async () => {
        try{
            const res = axios.get(URL+'api/kubok-register/');
            return (await res).data;
        }
        catch(e:any){
            console.log('ошибка при получении пользователей',e.message);
            throw e;
        }
    }
    // функция выполнения авторизации пользователя
    const auth = async ()=> {
        type User = {
            name:string,
            team_name:string,
            password:string
        }

        const user:User = {
            name,
            team_name:teamName,
            password
        }
        // делаем запрос к серверу
        try{
            const response = await axios.post(URL+'api/kubok-register/login',user);
            if(response.status === 200){
                console.log('Login successful');
                setTimeout(() => {
                    setAgreeDataUser('login');
                    setTimeout(() => {
                        Cookie.set('auth',user.team_name,{expires:1});
                        Cookie.set('userId',response.data.id,{expires:1});
                        navigate(`/user/${user.team_name}`);
                    }, 500);
                }, 1000);
            }
            return;
        }
        catch(e){
            console.log('ощибка при авторизации пользователя');
            setTimeout(() => {
                setAgreeDataUser("Parol yoki boshqa malumotlar noto'g'ri");
            }, 1000);
            
            throw e;
        };
    }

    useEffect(()=>{
        getUsers()
        .then(res=>setUsers(res))
        .catch(e=>console.log(e));
    },[]);
 
    
  return (
    <div className="form-wrapper">
        <div className="form">
            <form onSubmit={(e)=>{
                // сбрасываем обновления страницы при отправке
                e.preventDefault();
                // включаем лоадер 
                setFormLoader(true);
                // отключаем лоадер 
                setTimeout(() => {
                    setFormLoader(false);
                }, 1000);
                if(!register){
                    postRequest();
                }else{
                    auth();
                }
                
                
            }}>
                <div className="form-head">
                    <button type="button" className={register?'active':''} onClick={()=>{
                        window.location.reload();
                    }}>Kirish</button>
                    <button type="button" className={!register?'active':''} onClick={()=>{
                        setRegister(false);
                        setInputFocus(0);
                    }}>Ro'xatdan o'tish</button>
                </div>
                {
                    register ?
                    <>
                        <label className={inputFocus===1?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <circle cx="20.288" cy="8.344" r="1.707"></circle><path d="M18.581 11.513h3.413v3.656c0 .942-.765 1.706-1.707 1.706h-1.706v-5.362zM2.006 4.2v15.6l11.213 1.979V2.221L2.006 4.2zm8.288 5.411-1.95.049v5.752H6.881V9.757l-1.949.098V8.539l5.362-.292v1.364zm3.899.439v8.288h1.95c.808 0 1.463-.655 1.463-1.462V10.05h-3.413zm1.463-4.875c-.586 0-1.105.264-1.463.673v2.555c.357.409.877.673 1.463.673a1.95 1.95 0 0 0 0-3.901z"></path>
                                </svg>
                            </div>
                            <input type="text" name="team-name" placeholder="Jamoa nomi" maxLength={100} minLength={4} required onFocus={()=>setInputFocus(1)}
                             onChange={(e)=>setTeamName(e.target.value)}/>
                        </label>
                        <label className={inputFocus===2?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M15 11h7v2h-7zm1 4h6v2h-6zm-2-8h8v2h-8zM4 19h10v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2zm4-7c1.995 0 3.5-1.505 3.5-3.5S9.995 5 8 5 4.5 6.505 4.5 8.5 6.005 12 8 12z"></path>
                                </svg>
                            </div>
                            <input type="text" name="name"  placeholder="Isim" maxLength={50} minLength={4} required onFocus={()=>setInputFocus(2)}
                            onChange={(e)=>setName(e.target.value)}/>
                        </label>
                        <label className={inputFocus===3?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10 .002 8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z"></path>
                                </svg>
                            </div>
                            <input type={passwordSee?"password":"text"} name="password" placeholder="Parol" maxLength={50} required onFocus={()=>setInputFocus(3)}
                            onChange={(e)=>setPassword(e.target.value)}/>
                            <button type="button" className={`password-see ${passwordSee?'see':''}`} onClick={()=>setPasswordSee(prev=>!prev)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width={22}>
                                    <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"/>
                                </svg>
                            </button>
                        </label>
                        {/* лоадер появляется когда нажимаем кнопку отправить и проподает через 1 секунду */}
                        {
                            formLoader?
                            <div className="form-loader">
                                <div className="main-fader" responsive-height-comments>
                                    <div className="loader">
                                        <svg viewBox="0 0 866 866" xmlns="http://www.w3.org/2000/svg">
                                            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164.83 151.5">
                                                <path className="path-0" d="M117.24,69.24A8,8,0,0,0,115.67,67c-4.88-4-9.8-7.89-14.86-11.62A4.93,4.93,0,0,0,96.93,55c-5.76,1.89-11.4,4.17-17.18,6a4.36,4.36,0,0,0-3.42,4.12c-1,6.89-2.1,13.76-3,20.66a4,4,0,0,0,1,3.07c5.12,4.36,10.39,8.61,15.68,12.76a3.62,3.62,0,0,0,2.92.75c6.29-2.66,12.52-5.47,18.71-8.36a3.49,3.49,0,0,0,1.68-2.19c1.34-7.25,2.54-14.55,3.9-22.58Z"
                                                    fill="#40c456" />
                                                <path className="path-1" d="M97.55,38.68A43.76,43.76,0,0,1,98,33.44c.41-2.36-.5-3.57-2.57-4.64C91.1,26.59,87,24,82.66,21.82a6.18,6.18,0,0,0-4-.71C73.45,22.55,68.32,24.25,63.22,26c-3.63,1.21-6.08,3.35-5.76,7.69a26.67,26.67,0,0,1-.6,4.92c-1.08,8.06-1.08,8.08,5.86,11.92,3.95,2.19,7.82,5.75,11.94,6.08s8.76-2.41,13.12-3.93c9.33-3.29,9.33-3.3,9.78-14Z"
                                                    fill="#40c456" />
                                                <path className="path-2" d="M66.11,126.56c5.91-.91,11.37-1.7,16.81-2.71a3.3,3.3,0,0,0,1.87-2.17c1-4.06,1.73-8.19,2.84-12.24.54-2-.11-3-1.55-4.15-5-4-9.9-8.12-15-12a6.19,6.19,0,0,0-4.15-1.1c-5.35.66-10.7,1.54-16,2.54A4,4,0,0,0,48.34,97a109.13,109.13,0,0,0-3,12.19,4.47,4.47,0,0,0,1.34,3.6c5.54,4.36,11.23,8.53,16.91,12.69a10.84,10.84,0,0,0,2.57,1.11Z"
                                                    fill="#40c456" />
                                                <path className="path-3" d="M127.42,104.12c4.1-2.1,8-3.93,11.72-6a6,6,0,0,0,2.27-3,58.22,58.22,0,0,0,3.18-29.92c-.26-1.7-8-7.28-9.71-6.85A5,5,0,0,0,133,59.65c-2.81,2.49-5.71,4.88-8.33,7.56a9.46,9.46,0,0,0-2.47,4.4c-1.29,6.49-2.38,13-3.35,19.55a5.73,5.73,0,0,0,.83,3.91c2.31,3.08,5,5.88,7.7,9Z"
                                                    fill="#40c456" />
                                                <path className="path-4" d="M52.58,29.89c-2.15-.36-3.78-.54-5.39-.9-2.83-.64-4.92.1-7,2.32A64.1,64.1,0,0,0,26.09,54.64c-2.64,7.92-2.62,7.84,5.15,10.87,1.76.69,2.73.45,3.93-1C39.79,59,44.54,53.65,49.22,48.2a4.2,4.2,0,0,0,1.13-2c.8-5.32,1.49-10.68,2.24-16.34Z"
                                                    fill="#40c456" />
                                                <path className="path-5" fill="#40c456" d="M23,68.13c0,2.51,0,4.7,0,6.87a60.49,60.49,0,0,0,9.75,32.15c1.37,2.13,6.4,3,7,1.2,1.55-5,2.68-10.2,3.82-15.34.13-.58-.58-1.38-.94-2.06-2.51-4.77-5.47-9.38-7.45-14.37C32.94,71,28.22,69.84,23,68.13Z" />
                                                <path className="path-6" fill="#40c456" d="M83.91,12.86c-.32.36-.66.71-1,1.07.9,1.13,1.57,2.62,2.73,3.33,4.71,2.84,9.56,5.48,14.39,8.1a9.29,9.29,0,0,0,3.13.83c5.45.69,10.89,1.38,16.35,1.94a10.41,10.41,0,0,0,3.07-.71c-11.48-9.9-24.26-14.61-38.71-14.56Z"
                                                />
                                                <path className="path-7" fill="#40c456" d="M66.28,132.51c13.36,3.78,25.62,3.5,38-.9C91.68,129.59,79.36,128,66.28,132.51Z" />
                                                <path className="path-8" fill="#40c456" d="M127.2,30.66l-1.27.37a18.58,18.58,0,0,0,1,3.08c3,5.52,6.21,10.89,8.89,16.54,1.34,2.83,3.41,3.82,6.49,4.9a60.38,60.38,0,0,0-15.12-24.9Z" />
                                                <path className="bb-9" fill="#40c456" d="M117.35,125c5.58-2.32,16.9-13.84,18.1-19.2-2.41,1.46-5.18,2.36-6.78,4.23-4.21,5-7.89,10.37-11.32,15Z" />
                                            </svg>
                                        </svg>
                                    </div>
                                    <span>Yuklanmoqda...</span>
                                </div>
                            </div>:''
                        }
                        
                        {/* лоадер появляется когда нажимаем кнопку отправить и проподает через 1 секунду */}
                        {
                            agreeDataUser !== 'login'?
                            <p className="create-user-error">{agreeDataUser}</p>:
                            <>
                            <div className="top-loader">
                                <div className="top-loading-bar"></div>
                            </div>
                            </>
                        }
                        <button className="form-btn" type="submit" onClick={()=>setAgreeDataUser('')}>
                            <span>Kirish</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="m10.998 16 5-4-5-4v3h-9v2h9z"></path><path d="M12.999 2.999a8.938 8.938 0 0 0-6.364 2.637L8.049 7.05c1.322-1.322 3.08-2.051 4.95-2.051s3.628.729 4.95 2.051S20 10.13 20 12s-.729 3.628-2.051 4.95-3.08 2.051-4.95 2.051-3.628-.729-4.95-2.051l-1.414 1.414c1.699 1.7 3.959 2.637 6.364 2.637s4.665-.937 6.364-2.637C21.063 16.665 22 14.405 22 12s-.937-4.665-2.637-6.364a8.938 8.938 0 0 0-6.364-2.637z"></path>
                            </svg>
                        </button>
                        <div className="form-reset-pass">
                            <span>Parolni unutdingizmi?</span>
                            <a href="tel:+998933572014">+998(93)-357-20-14</a>
                        </div>
                    </>:
                    <>
                        <label className={inputFocus===1?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <circle cx="20.288" cy="8.344" r="1.707"></circle><path d="M18.581 11.513h3.413v3.656c0 .942-.765 1.706-1.707 1.706h-1.706v-5.362zM2.006 4.2v15.6l11.213 1.979V2.221L2.006 4.2zm8.288 5.411-1.95.049v5.752H6.881V9.757l-1.949.098V8.539l5.362-.292v1.364zm3.899.439v8.288h1.95c.808 0 1.463-.655 1.463-1.462V10.05h-3.413zm1.463-4.875c-.586 0-1.105.264-1.463.673v2.555c.357.409.877.673 1.463.673a1.95 1.95 0 0 0 0-3.901z"></path>
                                </svg>
                            </div>
                            <input type="text" name="team-name" placeholder="Jamoa nomi" maxLength={100} minLength={4} required onFocus={()=>setInputFocus(1)}/>
                        </label>
                        <label className={inputFocus===2?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M15 11h7v2h-7zm1 4h6v2h-6zm-2-8h8v2h-8zM4 19h10v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2zm4-7c1.995 0 3.5-1.505 3.5-3.5S9.995 5 8 5 4.5 6.505 4.5 8.5 6.005 12 8 12z"></path>
                                </svg>
                            </div>
                            <input type="text" name="name"  placeholder="Isim" maxLength={50} minLength={4} required onFocus={()=>setInputFocus(2)}/>
                        </label>
                        <label className={inputFocus===3?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M17.707 12.293a.999.999 0 0 0-1.414 0l-1.594 1.594c-.739-.22-2.118-.72-2.992-1.594s-1.374-2.253-1.594-2.992l1.594-1.594a.999.999 0 0 0 0-1.414l-4-4a.999.999 0 0 0-1.414 0L3.581 5.005c-.38.38-.594.902-.586 1.435.023 1.424.4 6.37 4.298 10.268s8.844 4.274 10.269 4.298h.028c.528 0 1.027-.208 1.405-.586l2.712-2.712a.999.999 0 0 0 0-1.414l-4-4.001zm-.127 6.712c-1.248-.021-5.518-.356-8.873-3.712-3.366-3.366-3.692-7.651-3.712-8.874L7 4.414 9.586 7 8.293 8.293a1 1 0 0 0-.272.912c.024.115.611 2.842 2.271 4.502s4.387 2.247 4.502 2.271a.991.991 0 0 0 .912-.271L17 14.414 19.586 17l-2.006 2.005z"></path>
                                </svg>
                            </div>
                            <input type="text" id="form-input-phone" name="phone" placeholder="Telefon raqam" minLength={17} onFocus={()=>setInputFocus(3)} required onChange={()=>{
                                
                                const element = document.getElementById('form-input-phone') as HTMLInputElement || null;
                                const maskOptions = {
                                mask: '+{998}(00)000-00-00'
                                };
                                 IMask(element, maskOptions);
                            }}/>
                        </label>
                        <label className={inputFocus===4?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm6 10 .002 8H6v-8h12zm-9-2V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9z"></path>
                                </svg>
                            </div>
                            <input type={passwordSee?"password":"text"} name="password"  placeholder="Parol o'ylab toping" maxLength={50} required onFocus={()=>setInputFocus(4)}/>  
                            <button type="button" className={`password-see ${passwordSee?'see':''}`} onClick={()=>setPasswordSee(prev=>!prev)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width={22}>
                                    <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"/>
                                </svg>
                            </button>
                        </label>
                        <label className={inputFocus===5?'focus':''}>
                            <div className="form-input-box">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277a1.993 1.993 0 0 1 .567-3.677A2.001 2.001 0 0 1 14 16a1.99 1.99 0 0 1-1 1.723z"></path>
                                </svg>
                            </div>
                            <input type={passwordSee?"password":"text"} name="password-verificate"  placeholder="Parolni tasdiqlang" maxLength={50} required onFocus={()=>setInputFocus(5)}/>
                            <button type="button" className={`password-see ${passwordSee?'see':''}`} onClick={()=>setPasswordSee(prev=>!prev)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width={22}>
                                    <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"/>
                                </svg>
                            </button>
                        </label>
                        {/* лоадер появляется когда нажимаем кнопку отправить и проподает через 1 секунду */}
                        {
                            formLoader?
                            <div className="form-loader">
                                <div className="main-fader">
                                    <div className="loader">
                                        <svg viewBox="0 0 866 866" xmlns="http://www.w3.org/2000/svg">
                                            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 164.83 151.5">
                                                <path className="path-0" d="M117.24,69.24A8,8,0,0,0,115.67,67c-4.88-4-9.8-7.89-14.86-11.62A4.93,4.93,0,0,0,96.93,55c-5.76,1.89-11.4,4.17-17.18,6a4.36,4.36,0,0,0-3.42,4.12c-1,6.89-2.1,13.76-3,20.66a4,4,0,0,0,1,3.07c5.12,4.36,10.39,8.61,15.68,12.76a3.62,3.62,0,0,0,2.92.75c6.29-2.66,12.52-5.47,18.71-8.36a3.49,3.49,0,0,0,1.68-2.19c1.34-7.25,2.54-14.55,3.9-22.58Z"
                                                    fill="#40c456" />
                                                <path className="path-1" d="M97.55,38.68A43.76,43.76,0,0,1,98,33.44c.41-2.36-.5-3.57-2.57-4.64C91.1,26.59,87,24,82.66,21.82a6.18,6.18,0,0,0-4-.71C73.45,22.55,68.32,24.25,63.22,26c-3.63,1.21-6.08,3.35-5.76,7.69a26.67,26.67,0,0,1-.6,4.92c-1.08,8.06-1.08,8.08,5.86,11.92,3.95,2.19,7.82,5.75,11.94,6.08s8.76-2.41,13.12-3.93c9.33-3.29,9.33-3.3,9.78-14Z"
                                                    fill="#40c456" />
                                                <path className="path-2" d="M66.11,126.56c5.91-.91,11.37-1.7,16.81-2.71a3.3,3.3,0,0,0,1.87-2.17c1-4.06,1.73-8.19,2.84-12.24.54-2-.11-3-1.55-4.15-5-4-9.9-8.12-15-12a6.19,6.19,0,0,0-4.15-1.1c-5.35.66-10.7,1.54-16,2.54A4,4,0,0,0,48.34,97a109.13,109.13,0,0,0-3,12.19,4.47,4.47,0,0,0,1.34,3.6c5.54,4.36,11.23,8.53,16.91,12.69a10.84,10.84,0,0,0,2.57,1.11Z"
                                                    fill="#40c456" />
                                                <path className="path-3" d="M127.42,104.12c4.1-2.1,8-3.93,11.72-6a6,6,0,0,0,2.27-3,58.22,58.22,0,0,0,3.18-29.92c-.26-1.7-8-7.28-9.71-6.85A5,5,0,0,0,133,59.65c-2.81,2.49-5.71,4.88-8.33,7.56a9.46,9.46,0,0,0-2.47,4.4c-1.29,6.49-2.38,13-3.35,19.55a5.73,5.73,0,0,0,.83,3.91c2.31,3.08,5,5.88,7.7,9Z"
                                                    fill="#40c456" />
                                                <path className="path-4" d="M52.58,29.89c-2.15-.36-3.78-.54-5.39-.9-2.83-.64-4.92.1-7,2.32A64.1,64.1,0,0,0,26.09,54.64c-2.64,7.92-2.62,7.84,5.15,10.87,1.76.69,2.73.45,3.93-1C39.79,59,44.54,53.65,49.22,48.2a4.2,4.2,0,0,0,1.13-2c.8-5.32,1.49-10.68,2.24-16.34Z"
                                                    fill="#40c456" />
                                                <path className="path-5" fill="#40c456" d="M23,68.13c0,2.51,0,4.7,0,6.87a60.49,60.49,0,0,0,9.75,32.15c1.37,2.13,6.4,3,7,1.2,1.55-5,2.68-10.2,3.82-15.34.13-.58-.58-1.38-.94-2.06-2.51-4.77-5.47-9.38-7.45-14.37C32.94,71,28.22,69.84,23,68.13Z" />
                                                <path className="path-6" fill="#40c456" d="M83.91,12.86c-.32.36-.66.71-1,1.07.9,1.13,1.57,2.62,2.73,3.33,4.71,2.84,9.56,5.48,14.39,8.1a9.29,9.29,0,0,0,3.13.83c5.45.69,10.89,1.38,16.35,1.94a10.41,10.41,0,0,0,3.07-.71c-11.48-9.9-24.26-14.61-38.71-14.56Z"
                                                />
                                                <path className="path-7" fill="#40c456" d="M66.28,132.51c13.36,3.78,25.62,3.5,38-.9C91.68,129.59,79.36,128,66.28,132.51Z" />
                                                <path className="path-8" fill="#40c456" d="M127.2,30.66l-1.27.37a18.58,18.58,0,0,0,1,3.08c3,5.52,6.21,10.89,8.89,16.54,1.34,2.83,3.41,3.82,6.49,4.9a60.38,60.38,0,0,0-15.12-24.9Z" />
                                                <path className="bb-9" fill="#40c456" d="M117.35,125c5.58-2.32,16.9-13.84,18.1-19.2-2.41,1.46-5.18,2.36-6.78,4.23-4.21,5-7.89,10.37-11.32,15Z" />
                                            </svg>
                                        </svg>
                                    </div>
                                    <span>Yuklanmoqda...</span>
                                </div>
                            </div>:''
                        }
                        
                        {/* лоадер появляется когда нажимаем кнопку отправить и проподает через 1 секунду */}
                        {
                            errorHaveUser ?
                            <p className="create-user-error">Bunaqa nomli jamoa ro'yxatdan o'tgan!</p>:
                            typeof createUser === 'boolean'?
                            !createUser?<p className="create-user-error">Parollar birxil emas!</p>:
                            <p className="create-user">Muvofoqiatli ro'yxatdan o'tdingiz</p>:''
                        }
                        <button className="form-btn" type="submit">
                            <span>Ro'yxatdan o'tish</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="m13 16 5-4-5-4v3H4v2h9z"></path>
                                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
                            </svg>
                        </button>
                    </>
                }
                
            </form>
        </div>
    </div>
  )
};

export default Form;