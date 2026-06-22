const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weather_img = document.querySelector('.weather-img');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const wind_speed = document.getElementById('wind-speed');

const location_not_found = document.querySelector('.location-not-found');
const weather_body = document.querySelector('.weather-body');
const locationDisplay = document.querySelector('.location'); 
const extraDetails = document.querySelector('.extra-details');
const timeDisplay = document.querySelector('.time');

function setBackground(condition) {
    const body = document.body;
    condition = condition.toLowerCase();

    if (condition.includes("clear")) body.style.background = "linear-gradient(135deg, #f6d365, #fda085)";
    else if (condition.includes("cloud")) body.style.background = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
    else if (condition.includes("rain")) body.style.background = "linear-gradient(135deg, #00c6fb, #005bea)";
    else if (condition.includes("storm") || condition.includes("thunder")) body.style.background = "linear-gradient(135deg, #232526, #414345)";
    else if (condition.includes("snow")) body.style.background = "linear-gradient(135deg, #83a4d4, #b6fbff)";
    else if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) body.style.background = "linear-gradient(135deg, #606c88, #3f4c6b)";
    else body.style.background = "linear-gradient(135deg, #1e3c72, #2a5298)";
}


function formatTime(timezoneOffset) {
    const utc = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (1000 * timezoneOffset));
    return localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}


async function fetchAQI(lat, lon) {
    const api_key = "8dbd95994e65c527ad5cf79684f4f6e2";
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;
    const aqi_data = await fetch(url).then(res => res.json());
    if (aqi_data?.list?.length > 0) return aqi_data.list[0].main.aqi;
    return "N/A";
}


function getAQIText(aqi) {
    switch (aqi) {
        case 1: return "🟢 Good";
        case 2: return "🟡 Fair";
        case 3: return "🟠 Moderate";
        case 4: return "🔴 Poor";
        case 5: return "🟣 Very Poor";
        default: return "⚪ N/A";
    }
}

async function updateWeatherUI(weather_data) {
    location_not_found.style.display = "none";
    weather_body.style.display = "flex";

    temperature.innerHTML = `${Math.round(weather_data.main.temp - 273.15)}°C`;
    description.innerHTML = `${weather_data.weather[0].description}`;
    humidity.innerHTML = `${weather_data.main.humidity}%`;
    wind_speed.innerHTML = `${weather_data.wind.speed} Km/H`;

    
    if (locationDisplay) {
        locationDisplay.innerHTML = `📍 ${weather_data.name}, ${weather_data.sys.country}`;
        locationDisplay.style.display = "block";
    }

    
    if (timeDisplay) {
        timeDisplay.innerHTML = `🕒 ${formatTime(weather_data.timezone)}`;
    }

    
    const aqi = await fetchAQI(weather_data.coord.lat, weather_data.coord.lon);
    if (extraDetails) {
        extraDetails.innerHTML = `
            🌍 Lat: ${weather_data.coord.lat.toFixed(2)}, Lon: ${weather_data.coord.lon.toFixed(2)}<br>
            🌫️ AQI: ${getAQIText(aqi)}
        `;
    }

    
    switch (weather_data.weather[0].main) {
        case 'Clouds': weather_img.src = "/assets/cloud.png"; break;
        case 'Clear': weather_img.src = "/assets/clear.png"; break;
        case 'Rain': weather_img.src = "/assets/rain.png"; break;
        case 'Mist':
        case 'Haze': weather_img.src = "/assets/mist.png"; break;
        case 'Snow': weather_img.src = "/assets/snow.png"; break;
    }

    setBackground(weather_data.weather[0].description);
}


async function checkWeather(city) {
    const api_key = "8dbd95994e65c527ad5cf79684f4f6e2";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}`;
    const weather_data = await fetch(url).then(res => res.json());

    if (weather_data.cod === `404`) {
        location_not_found.style.display = "flex";
        weather_body.style.display = "none";
        return;
    }
    updateWeatherUI(weather_data);
}

async function checkWeatherByCoords(lat, lon) {
    const api_key = "8dbd95994e65c527ad5cf79684f4f6e2";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`;
    const weather_data = await fetch(url).then(res => res.json());

    if (weather_data.cod === `404`) {
        location_not_found.style.display = "flex";
        weather_body.style.display = "none";
        return;
    }
    updateWeatherUI(weather_data);
}

searchBtn.addEventListener('click', () => {
    checkWeather(inputBox.value);
});

window.addEventListener('load', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                checkWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            () => {
                console.log("Geolocation denied, please search manually.");
            }
        );
    }
});
