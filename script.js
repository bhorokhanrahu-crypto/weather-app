const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitBtn = document.getElementById("unitBtn");

const weatherContent = document.getElementById("weatherContent");
const welcome = document.getElementById("welcome");
const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const errorText = document.getElementById("errorText");

let currentData = null;
let isCelsius = true;

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

unitBtn.addEventListener("click", function () {
    if (!currentData) return;

    isCelsius = !isCelsius;
    unitBtn.textContent = isCelsius ? "°C" : "°F";
    updateTemperature();
});

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    showLoading();

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error();
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the spelling.");
        }

        const location = geoData.results[0];

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility&daily=sunrise,sunset&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error();
        }

        const weatherData = await weatherResponse.json();

        currentData = {
            location,
            weather: weatherData
        };

        displayWeather();

    } catch (error) {
        showError(error.message || "Unable to fetch weather data.");
    }
}

function displayWeather() {
    const { location, weather } = currentData;
    const current = weather.current;
    const daily = weather.daily;

    document.getElementById("cityName").textContent = location.name;

    document.getElementById("countryName").textContent =
        `${location.country}${location.admin1 ? " • " + location.admin1 : ""}`;

    const condition = getWeatherCondition(current.weather_code);

    document.getElementById("weatherIcon").textContent = condition.icon;
    document.getElementById("condition").textContent = condition.text;

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById("wind").textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    document.getElementById("pressure").textContent =
        `${Math.round(current.surface_pressure)} hPa`;

    document.getElementById("visibility").textContent =
        `${(current.visibility / 1000).toFixed(1)} km`;

    document.getElementById("sunrise").textContent =
        formatTime(daily.sunrise[0]);

    document.getElementById("sunset").textContent =
        formatTime(daily.sunset[0]);

    updateTemperature();

    loading.classList.add("hidden");
    errorBox.classList.add("hidden");
    welcome.classList.add("hidden");
    weatherContent.classList.remove("hidden");
}

function updateTemperature() {
    const current = currentData.weather.current;

    let temperature = current.temperature_2m;
    let feelsLike = current.apparent_temperature;

    if (!isCelsius) {
        temperature = celsiusToFahrenheit(temperature);
        feelsLike = celsiusToFahrenheit(feelsLike);
    }

    document.getElementById("temperature").textContent =
        Math.round(temperature);

    document.querySelector(".temperature sup").textContent =
        isCelsius ? "°C" : "°F";

    document.getElementById("feelsLike").textContent =
        `${Math.round(feelsLike)}°${isCelsius ? "C" : "F"}`;
}

function celsiusToFahrenheit(value) {
    return (value * 9 / 5) + 32;
}

function formatTime(dateString) {
    const date = new Date(dateString);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function showLoading() {
    loading.classList.remove("hidden");
    errorBox.classList.add("hidden");
    weatherContent.classList.add("hidden");
    welcome.classList.add("hidden");
}

function showError(message) {
    loading.classList.add("hidden");
    weatherContent.classList.add("hidden");
    welcome.classList.add("hidden");

    errorText.textContent = message;
    errorBox.classList.remove("hidden");
}

function getWeatherCondition(code) {
    const conditions = {
        0: {
            text: "Clear Sky",
            icon: "☀️"
        },
        1: {
            text: "Mainly Clear",
            icon: "🌤️"
        },
        2: {
            text: "Partly Cloudy",
            icon: "⛅"
        },
        3: {
            text: "Overcast",
            icon: "☁️"
        },
        45: {
            text: "Foggy",
            icon: "🌫️"
        },
        48: {
            text: "Rime Fog",
            icon: "🌫️"
        },
        51: {
            text: "Light Drizzle",
            icon: "🌦️"
        },
        53: {
            text: "Drizzle",
            icon: "🌦️"
        },
        55: {
            text: "Heavy Drizzle",
            icon: "🌧️"
        },
        61: {
            text: "Light Rain",
            icon: "🌦️"
        },
        63: {
            text: "Rain",
            icon: "🌧️"
        },
        65: {
            text: "Heavy Rain",
            icon: "🌧️"
        },
        71: {
            text: "Light Snow",
            icon: "🌨️"
        },
        73: {
            text: "Snow",
            icon: "❄️"
        },
        75: {
            text: "Heavy Snow",
            icon: "❄️"
        },
        80: {
            text: "Rain Showers",
            icon: "🌦️"
        },
        81: {
            text: "Rain Showers",
            icon: "🌧️"
        },
        82: {
            text: "Heavy Showers",
            icon: "⛈️"
        },
        95: {
            text: "Thunderstorm",
            icon: "⛈️"
        },
        96: {
            text: "Thunderstorm & Hail",
            icon: "⛈️"
        },
        99: {
            text: "Heavy Thunderstorm",
            icon: "⛈️"
        }
    };

    return conditions[code] || {
        text: "Unknown",
        icon: "🌍"
    };
}