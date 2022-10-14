// ****** API **********
const API_URl = `https://mars.nasa.gov/rss/api/?feed=weather&category=insight_temperature&feedtype=json&ver=1.0`;

// ****** SELECT ITEMS **********
const currentSolEl = document.querySelector("[data-current-sol]");
const currentdateEl = document.querySelector("[data-current-date]");
const currentTempAvEl = document.querySelector("[data-current-temp-average]");
const currentTempHighEl = document.querySelector("[data-current-temp-high]");
const currentTempLowEl = document.querySelector("[data-current-temp-low]");
const WindSpeedEl = document.querySelector("[data-wind-speed]");
const WindDirectionArrow = document.querySelector("[data-wind-direction-arrow]");

const previousSolTemplate = document.querySelector("[data-previous-sol]");
const previousSolContainer = document.querySelector("[data-previous-sols]");

const unitToggle = document.querySelector("[data-unit-toggle]");
const metricRadio = document.getElementById("cel");
const imperialRadio = document.getElementById("fah");


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentDate = `${months[new Date().getMonth()]} ${new Date().getDate()}`
let count = 6;
let currentSolIndex;


// ****** FUNCTIONS **********
// get the info from the API
function getWeather() {
    return fetch(API_URl)
        .then(res => res.json())
        .then(data => {
            const {
                sol_keys,
                validity_checks,
                ...solData
            } = data
            return Object.entries(solData).map(([sol, data]) => {
                return {
                    sol: sol,
                    avTemp: data.AT.av,
                    maxTemp: data.AT.mx,
                    minTemp: data.AT.mn,
                    windspeed: data.HWS.av,
                    windDirection: data.WD.most_common.compass_degrees
                }
            })
        })
}

// get previous days
function getPrevDate() {
    if (count === -1) {
        count = 6;
    }
    date = new Date();
    date.setDate(date.getDate() - count);
    count--;
    return `${months[date.getMonth()]} ${date.getDate()}`
}

// display the current sol
function displayCurrentSol(sol) {
    const currentSol = sol[currentSolIndex];
    currentSolEl.innerHTML = currentSol.sol;
    currentdateEl.innerHTML = currentDate;
    currentTempAvEl.innerHTML = getTemp(currentSol.avTemp);
    currentTempHighEl.innerHTML = getTemp(currentSol.maxTemp);
    currentTempLowEl.innerHTML = getTemp(currentSol.minTemp);
    WindSpeedEl.innerHTML = getSpeed(currentSol.windspeed);
    WindDirectionArrow.style.setProperty("--direction", `${currentSol.windDirection}deg`);
}

// display the previous sols
function displayPreviousSols(sols) {
    previousSolContainer.innerHTML = "";
    sols.forEach((solData, index) => {
        const solContainer = previousSolTemplate.content.cloneNode(true);
        solContainer.querySelector("[data-sol]").innerText = solData.sol
        solContainer.querySelector("[data-date]").innerHTML = getPrevDate();
        solContainer.querySelector("[data-temp-high]").innerHTML = getTemp(solData.maxTemp);
        solContainer.querySelector("[data-temp-low]").innerHTML = getTemp(solData.minTemp);
        solContainer.querySelector("[data-select-button]").addEventListener("click", () => {
            currentSolIndex = index;
            displayCurrentSol(sols);
        })
        previousSolContainer.appendChild(solContainer);

    });
}

// get the temperature and convert if needed
function getTemp(temperature) {
    let returnTemp = temperature;
    if (!isMetric()) {
        returnTemp = (temperature * (9 / 5)) + 32;
    }
    return Math.round(returnTemp);
}

// get the wind speed and convert if needed
function getSpeed(speed) {
    let returnSpeed = speed;
    if (!isMetric()) {
        returnSpeed = speed / 1.609;
    }
    return Math.round(returnSpeed);
}

// update the units between metric and imperial
function updateUnits() {
    const tempUnits = document.querySelectorAll("[data-temp-unit]");
    const speedUnits = document.querySelectorAll("[data-speed-unit]");
    tempUnits.forEach(unit => {
        unit.innerText = isMetric() ? "°C" : "°F";
    })
    speedUnits.forEach(unit => {
        unit.innerText = isMetric() ? "kph" : "mph";
    })
}

// check if metric
function isMetric() {
    return metricRadio.checked;
}


// ****** MAIN **********
getWeather().then(sols => {
    currentSolIndex = sols.length - 1;
    displayCurrentSol(sols);
    displayPreviousSols(sols);
    updateUnits();

    unitToggle.addEventListener("click", () => {
        let metricUnits = !isMetric();
        metricRadio.checked = metricUnits;
        imperialRadio.checked = !metricUnits;
        displayCurrentSol(sols);
        displayPreviousSols(sols);
        updateUnits();
    })

    metricRadio.addEventListener("change", () => {
        displayCurrentSol(sols);
        displayPreviousSols(sols);
        updateUnits();
    })

    imperialRadio.addEventListener("change", () => {
        displayCurrentSol(sols);
        displayPreviousSols(sols);
        updateUnits();
    })
})