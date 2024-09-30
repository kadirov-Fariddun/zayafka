import React, { useState } from 'react';
import axios from 'axios';

const FormComponent: React.FC = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [age, setAge] = useState<number>(0);
  const [photo, setPhoto] = useState<File | null>(null);

  // Функция для отправки фото в Telegram
  const sendPhotoToTelegram = async (photo: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await axios.post(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendPhoto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.result.photo[0].file_id; // Получите file_id
  };

  // Функция для получения URL фото
  const getFileUrl = async (file_id: string): Promise<string> => {
    const response = await axios.get(`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getFile?file_id=${file_id}`);
    const filePath = response.data.result.file_path;
    return `https://api.telegram.org/file/bot<YOUR_BOT_TOKEN>/${filePath}`;
  };

  // Функция для сохранения данных в MySQL
  const saveDataToMySQL = async (data: { firstname: string; lastname: string; photo_url: string; age: number }) => {
    const response = await axios.post('http://your-api-url/save-data', data);
    return response.data;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Создаем FormData
    const formData = new FormData();
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('age', age.toString());
    if (photo) {
      formData.append('photo', photo); // Добавляем фото только если оно выбрано
    }

    try {
      // Отправляем фото в Telegram
      const file_id = await sendPhotoToTelegram(photo!); // Принуждаем TypeScript, что photo не null
      const photoUrl = await getFileUrl(file_id);
      
      // Подготовим данные для сохранения
      const data = {
        firstname,
        lastname,
        photo_url: photoUrl,
        age,
      };

      // Сохраняем данные в MySQL
      await saveDataToMySQL(data);

      console.log("Данные успешно сохранены!");
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Имя:
        <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
      </label>
      <label>
        Фамилия:
        <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
      </label>
      <label>
        Возраст:
        <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} required />
      </label>
      <label>
        Фото:
        <input type="file" accept="image/*" onChange={(e) => {
          if (e.target.files) {
            setPhoto(e.target.files[0]);
          }
        }} />
      </label>
      <button type="submit">Отправить</button>
    </form>
  );
};

export default FormComponent;
