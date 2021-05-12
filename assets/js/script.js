var searchCity = $("#city-search");
var searchButton = $("#search-button");
var currentWeather = $("#current");
var selectedCity = $("#city");
var temperature = $("#temperature");
var humidity = $("#humidity");
var wind = $("#wind-speed");
var uvIndex = $("#uv-index");
var clearHistoryButton = $("#clear-history");
var list = $(".list-group");
var additionalInfo = $("#info");
var pressure = $("#pressure");
var sunrise = $("#sunrise");
var sunset = $("#sunset");

const API_KEY = "5e39050a0422e1482db019790198600d";

var city = "";

function getUserInput() {
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        searchCity.val("");
    } else {
        $('[data-toggle="popover"]').popover("toggle");
        city = "";
    }
}

function saveToLocalStorage(city) {
    var cities = JSON.parse(localStorage.getItem("cities") || "[]");
    if (city !== "" && city !== undefined && !cities.includes(city)) {
        cities.push(city);
        localStorage.setItem("cities", JSON.stringify(cities));
    }
}

function renderHistory() {
    var array = JSON.parse(localStorage.getItem("cities") || "[]");
    list.empty();
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        var listEl = $("<li>" + element + "</li>");
        $(listEl).attr("class", "list-group-item");
        $(listEl).attr("data-value", element.toLowerCase());
        list.append(listEl);
    }

}

function getWeather(city) {
    const parsedResponsePromise = createWeatherPromise(city)
        .then(checkResponse)
        .then(parseResponseJson)
        .catch(function (errorMessage) {
            if (typeof errorMessage !== "string") {
                errorMessage = "Can't connect to server";
            }
            $(".col-sm-8").empty();
            var error = $(`<div class="ui placeholder segment">
                            <div class="ui icon header">
                                <i class="search icon"></i>
                                ${errorMessage}
                            </div>
                        </div>`);
            $(".col-sm-8").append(error);
        });

    parsedResponsePromise
        .then(renderWeather)
        .catch(function (errorMessage) {
            if (typeof errorMessage !== "string") {
                errorMessage = "Can't connect to server";
            }
            $(".col-sm-8").empty();
            var error = $(`<div class="ui placeholder segment">
                            <div class="ui icon header">
                                <i class="search icon"></i>
                                ${errorMessage}
                            </div>
                        </div>`);
            $(".col-sm-8").append(error);
        });

    parsedResponsePromise
        .then(updateHistory)
        .catch(function (errorMessage) {
            if (typeof errorMessage !== "string") {
                errorMessage = "Can't connect to server";
            }
            $(".col-sm-8").empty();
            var error = $(`<div class="ui placeholder segment">
                            <div class="ui icon header">
                                <i class="search icon"></i>
                                ${errorMessage}
                            </div>
                        </div>`);
            $(".col-sm-8").append(error);
        });

    parsedResponsePromise
        .then(createForecastPromise)
        .then(parseResponseJson)
        .then(renderForecast)
        .catch(function (errorMessage) {
            if (typeof errorMessage !== "string") {
                errorMessage = "Can't connect to server";
            }
            $(".col-sm-8").empty();
            var error = $(`<div class="ui placeholder segment">
                            <div class="ui icon header">
                                <i class="search icon"></i>
                                ${errorMessage}
                            </div>
                        </div>`);
            $(".col-sm-8").append(error);
        });

    parsedResponsePromise
        .then(createUVIndexPromise)
        .then(parseResponseJson)
        .then(renderUVIndex)
        .catch(function (errorMessage) {
            if (typeof errorMessage !== "string") {
                errorMessage = "Can't connect to server";
            }
            $(".col-sm-8").empty();
            var error = $(`<div class="ui placeholder segment">
                            <div class="ui icon header">
                                <i class="search icon"></i>
                                ${errorMessage}
                            </div>
                        </div>`);
            $(".col-sm-8").append(error);
        });
}

function checkResponse(response) {
    if (!response.ok) {
        searchCity.addClass("border border-danger");
    } else {
        searchCity.removeClass("border border-danger");
    }
    return response;
}

function parseResponseJson(response) {
    if (!response.ok) {
        throw "Can't retrieve data";
    }
    return response.json();
}

function createWeatherPromise(city) {
    var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=imperial`;
    return fetch(url);
}

function updateHistory(data) {
    var cityName = data.name;
    saveToLocalStorage(cityName);
    renderHistory();
}

function createForecastPromise(data) {
    const cityId = data.id;
    var url = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${API_KEY}&units=imperial`;
    return fetch(url);
}

function renderWeather(data) {
    var date = moment().format("L");
    var iconId = data.weather[0].icon;
    console.log(data)
    var iconUrl = `http://openweathermap.org/img/wn/${iconId}@2x.png`
    selectedCity.html(data.name + " (" + date + ") " + `<img src=${iconUrl} alt="Weather icon">`);
    temperature.text(data.main.temp + " ºF");
    humidity.text(data.main.humidity + "%");
    wind.text(data.wind.speed + " MPH");
    pressure.text(data.main.pressure);
    sunrise.text(moment.unix(data.sys.sunrise).format("LT"));
    sunset.text(moment.unix(data.sys.sunset).format("LT"));
}

function renderForecast(data) {
    for (let i = 0; i < 5; i++) {
        const element = data.list[(i + 1) * 8 - 1];

        var date = moment.unix(element.dt).format("L");
        var temperature = element.main.temp;
        var humidity = element.main.humidity;
        var iconId = element.weather[0].icon;
        var iconUrl = `http://openweathermap.org/img/wn/${iconId}.png`
        var wind = element.wind.speed;

        $(`#date${i}`).html(` ${date}` + `<img src=${iconUrl} alt="Weather icon">`);
        $(`#temp${i}`).text(` ${temperature}\xa0ºF`);
        $(`#humidity${i}`).text(` ${humidity}%`);
        $(`#speed${i}`).text(` ${wind} mph`);
    }
}

function createUVIndexPromise(data) {
    const latitude = data.coord.lat;
    const longitude = data.coord.lon;
    var url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,daily,alers&appid=${API_KEY}`;
    return fetch(url);
}

function renderUVIndex(data) {
    uvIndex.removeClass("bg-success bg-warning bg-danger text-white text-dark");
    var index = data.current.uvi;
    uvIndex.html(index);
    if (index <= 2) {
        uvIndex.addClass("bg-success text-white");
    } else if (index > 2 && index <= 7) {
        uvIndex.addClass("bg-warning text-dark");
    } else {
        uvIndex.addClass("bg-danger text-white")
    }
}

searchButton.on("click", function () {
    getUserInput();
    getWeather(city);
});

$(window).on("load", renderHistory);

list.on("click", ".list-group-item", function () {
    var cityName = $(this).attr("data-value");
    getWeather(cityName);
})

clearHistoryButton.on("click", function () {
    localStorage.clear();
    renderHistory();
})
