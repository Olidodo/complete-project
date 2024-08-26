import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';

const WeatherApp = ({ className, onRainStatusChange }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);


//  想要顯示下雨 三步驟
// 1. 前往35行，把true註解出來，並將原本的return註解掉
// 2. 前往75行註解掉，把77行註解出來
// 3. 前往81行註解掉，把83行註解出來

  const getWeatherIcon = (weatherDescription) => {
    if (weatherDescription.includes("晴")) {
        return "../images/icon/sunny.svg";
    } else if (weatherDescription.includes("多雲")) {
        return "../images/icon/cloudy.svg";
    } else if (weatherDescription.includes("陰")) {
        return "../images/icon/cloud.svg";
    } else if (weatherDescription.includes("雨")) {
        return "../images/icon/rainy.svg";
    } else if (weatherDescription.includes("雷")) {
        return "../images/icon/lightning.svg";
    }else if (weatherDescription.includes("霧")) {
        return "../images/icon/fog.svg";
    }else {
        return "../images/icon/warning.svg"; // 找不到匹配時的預設圖片
    }
};

const checkIfRaining = (data) => {
  return data.WeatherElement.Weather.includes('雨');
  // 改為true 即可下雨
  // return true
};

useEffect(() => {
  const fetchWeatherData = async () => {
    try {
      const response = await axios.get('https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWA-5BBE0E82-87F0-4AE9-8EDE-43EBA36F7FBD&format=JSON&StationName=%E8%87%BA%E4%B8%AD');
      setWeatherData(response.data.records.Station[0]);
      
      const isRaining = checkIfRaining(response.data.records.Station[0]);
      onRainStatusChange(isRaining);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  fetchWeatherData();
}, [onRainStatusChange]);

if (!weatherData) {
  return <div className="loading">Loading...</div>;
}

const { StationName, WeatherElement, ObsTime } = weatherData;

return (
  <div 
    className={`weather-card ${isExpanded ? 'expanded' : ''} `}
    onMouseEnter={() => setIsExpanded(true)}
    onMouseLeave={() => setIsExpanded(false)}
    style={{
      position: "fixed",
      bottom: "48px",
      right: "48px",
      zindex: 1020}}
  >
    <div className="weather-brief">
      <h2 className="city-name">{StationName}</h2>
      <div className="weather-info">
        <p className="weather-description">{WeatherElement.Weather}</p>
        {/* 註解掉即可顯示雨 */}
        {/* <p className="weather-description">雨</p> */}
      </div>
      <div className="temperature-container">
        <p className="temperature">{Math.round(WeatherElement.AirTemperature)}°</p>
        <img className="weather-icon" src={getWeatherIcon(WeatherElement.Weather)} alt="" />
        {/* 註解掉即可顯示雨圖片 */}
        {/* <img className="weather-icon" src="../images/icon/rainy.svg" alt="" /> */}
      </div>
    </div>
    {isExpanded && (
      <div className="weather-details">
        <div className="details-column">
          <div className="detail-item wind-speed">
            <img src="../images/icon/wind_speed.svg" alt="" />
            <p>風速：{WeatherElement.WindSpeed} m/s</p>
          </div>
          <div className="detail-item uv-index">
            <img src="../images/icon/UV.svg" alt="" />
            <p>紫外線指數：{WeatherElement.UVIndex}</p>
          </div>
          <div className="detail-item humidity">
            <img src="../images/icon/humidity.svg" alt="" />
            <p>濕度：{WeatherElement.RelativeHumidity}%</p>
          </div>
        </div>
        <p className="observation-time">最後更新：{new Date(ObsTime.DateTime).toLocaleString()}</p>
      </div>
    )}
  </div>
);
};

export default WeatherApp;