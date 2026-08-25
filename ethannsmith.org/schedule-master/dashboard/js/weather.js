// ======================================================
// WEATHER SYSTEM
// Open-Meteo API
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const temperature =
    document.getElementById("temperature");


const description =
    document.getElementById("weatherDescription");


const highTemp =
    document.getElementById("highTemp");


const lowTemp =
    document.getElementById("lowTemp");


const locationName =
    document.getElementById("locationName");



// ======================================================
// WEATHER CODE TRANSLATOR
// ======================================================

function getWeatherDescription(code){


    const weatherCodes = {


        0:
        "Clear Sky ☀️",


        1:
        "Mostly Clear 🌤",


        2:
        "Partly Cloudy ⛅",


        3:
        "Overcast ☁️",


        45:
        "Fog 🌫",


        48:
        "Fog 🌫",


        51:
        "Light Drizzle 🌧",


        53:
        "Drizzle 🌧",


        55:
        "Heavy Drizzle 🌧",


        61:
        "Light Rain 🌦",


        63:
        "Rain 🌧",


        65:
        "Heavy Rain 🌧",


        71:
        "Light Snow ❄️",


        73:
        "Snow ❄️",


        75:
        "Heavy Snow ❄️",


        80:
        "Rain Showers 🌦",


        81:
        "Rain Showers 🌧",


        82:
        "Heavy Showers 🌧",


        95:
        "Thunderstorm ⛈"


    };


    return weatherCodes[code] || "Unknown";

}



// ======================================================
// LOAD WEATHER
// ======================================================

async function loadWeather(latitude, longitude){


    try{


        const response = await fetch(

            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`

        );



        const data =
            await response.json();




        temperature.textContent =

            Math.round(
                data.current.temperature_2m
            );



        description.textContent =

            getWeatherDescription(
                data.current.weather_code
            );



        highTemp.textContent =

            Math.round(
                data.daily.temperature_2m_max[0]
            );



        lowTemp.textContent =

            Math.round(
                data.daily.temperature_2m_min[0]
            );


    }


    catch(error){


        console.error(
            "Weather error:",
            error
        );


        description.textContent =
            "Weather unavailable";


    }


}



// ======================================================
// GET LOCATION NAME
// ======================================================

async function getLocationName(latitude, longitude){


    try{


        const response = await fetch(

            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`

        );


        const data =
            await response.json();



        const address =
            data.address;



        const city =

            address.city ||

            address.town ||

            address.village ||

            "Unknown";



        const state =

            address.state ||

            "";



        locationName.textContent =

            `📍 ${city}, ${state}`;


    }


    catch(error){


        console.error(
            "Location error:",
            error
        );


        locationName.textContent =
            "Location unavailable";


    }


}



// ======================================================
// GET USER LOCATION
// ======================================================

function getLocation(){


    if(!navigator.geolocation){


        locationName.textContent =
            "Location not supported";


        return;


    }



    navigator.geolocation.getCurrentPosition(


        (position)=>{


            const latitude =

                position.coords.latitude;



            const longitude =

                position.coords.longitude;



            loadWeather(
                latitude,
                longitude
            );


            getLocationName(
                latitude,
                longitude
            );


        },



        (error)=>{


            console.error(
                "Location error:",
                error
            );


            locationName.textContent =

                "Location permission denied";


            description.textContent =

                "Enable location access";


        }



    );


}



// ======================================================
// START WEATHER
// ======================================================

getLocation();



// Refresh every 10 minutes

setInterval(

    getLocation,

    600000

);