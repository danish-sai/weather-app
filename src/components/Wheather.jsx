import { useRef, useState, useEffect } from 'react'
import './Wheather.css'
import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import humidity_icon from '../assets/humidity.png'

const Wheather = () => {

    const inputRef = useRef()
    const [error, setError] = useState("");
    const [weatherData, setWeatherData] = useState(false);

    const allIcons = {
        "01d": clear_icon,
        "01n": clear_icon,
        "02d": cloud_icon,
        "02n": cloud_icon,
        "03d": cloud_icon,
        "03n": cloud_icon,
        "04d": drizzle_icon,
        "04n": drizzle_icon,
        "09d": rain_icon,
        "09n": rain_icon,
        "10d": rain_icon,
        "10n": rain_icon,
        "13d": snow_icon,
        "13n": snow_icon,
    }

    const getBackgroundClass = (main) => {
        switch (main) {
            case 'Clear':
                return 'clear-bg';
            case 'Clouds':
                return 'cloudy-bg';
            case 'Rain':
            case 'Drizzle':
                return 'rainy-bg';
            case 'Snow':
                return 'snowy-bg';
            case 'Thunderstorm':
                return 'stormy-bg';
            default:
                return 'default-bg';
        }
    };

    const getWeatherEmoji = (main) => {
        switch (main.toLowerCase()) {
            case "clear":
                return "☀️";
            case "clouds":
                return "☁️";
            case "rain":
                return "🌧️";
            case "drizzle":
                return "🌦️";
            case "snow":
                return "❄️";
            case "thunderstorm":
                return "🌩️";
            case "mist":
            case "fog":
            case "haze":
                return "🌫️";
            default:
                return "🌈";
        }
    };



    const search = async (city = null, lat = null, lon = null) => {
        if (!city && (lat === null || lon === null)) {
            setError("Please enter a city or allow location access.");
            return;
        }

        setError("");

        try {
            const baseUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${import.meta.env.VITE_APP_ID}`;
            const url = city
                ? `${baseUrl}&q=${city}`
                : `${baseUrl}&lat=${lat}&lon=${lon}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "City not found.");
                return;
            }

            const icon = allIcons[data.weather[0].icon] || clear_icon;

            setWeatherData({
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                temprature: Math.floor(data.main.temp),
                location: data.name,
                icon: icon,
                description: data.weather[0].description,
                main: data.weather[0].main
            });

        } catch (error) {
            setError("Something went wrong. Try again.");
            setWeatherData(false);
        }
    };


    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    search(null, latitude, longitude); // Call search using coordinates
                },
                (error) => {
                    console.warn("Geolocation error:", error);
                    setError("Location access denied. Showing default city.");
                    search("Okara"); // Fallback city
                }
            );
        } else {
            setError("Geolocation not supported by your browser.");
            search("Lahore"); // Fallback
        }
    }, []);


    return (
        <div className="weather-container">
            <div className={`weather ${weatherData ? getBackgroundClass(weatherData.main) : 'default-bg'}`}>
                <div className="search-bar">
                    <input ref={inputRef} type="text" placeholder="Search" />
                    <img
                        src={search_icon}
                        alt="search"
                        onClick={() => {
                            const city = inputRef.current.value;
                            search(city);
                            inputRef.current.value = "";
                        }}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                {weatherData && (
                    <>
                        <img src={weatherData.icon} alt="" className="weather-icon" />
                        <p className="temprature">{weatherData.temprature}°C</p>
                        <p className="location">{weatherData.location}</p>
                        <p className="description">
                            {getWeatherEmoji(weatherData.main)} {weatherData.description}
                        </p>


                        <div className="weather-data">
                            <div className="col">
                                <img src={humidity_icon} alt="humidity" />
                                <div>
                                    <p>{weatherData.humidity}%</p>
                                    <span>Humidity</span>
                                </div>
                            </div>
                            <div className="col">
                                <img src={wind_icon} alt="wind" />
                                <div>
                                    <p>{weatherData.windSpeed} Km/h</p>
                                    <span>Wind Speed</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Wheather
