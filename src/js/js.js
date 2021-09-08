// select all elements
const country_name_element = document.querySelector(".country .country-name");
const total_cases_element = document.querySelector(".total-case .value");
const new_cases_element = document.querySelector(".total-case .new-value");
const recovered_cases_element = document.querySelector(".recovered .value");
const new_recovered_cases_element = document.querySelector(
  ".recovered .new-value"
);
const death_cases_element = document.querySelector(".deaths .value");
const new_death_cases_element = document.querySelector(".deaths .new-value");

//for the chart setting
const ctx = document.getElementById("axes_line_chart").getContext("2d");

//for the global stats html elements
const global_total_cases_element = document.querySelector(
  ".total-confirmed .g-value"
);
const global_new_total_cases_element = document.querySelector(
  ".total-confirmed .new-g-value"
);

const global_recovered_cases_element = document.querySelector(
  ".total-recovered .g-recovered-value"
);
const global_new_recovred_cases_element = document.querySelector(
  ".total-recovered .new-g-recovered-value"
);

const global_deaths_cases_element = document.querySelector(
  ".total-deaths .g-deaths-value"
);
const global_new_deaths_cases_element = document.querySelector(
  ".total-deaths .new-g-deaths-value"
);

//selecting html for news part
const country_new_name_element = document.querySelector(".news .news-heading");
const country_news_title_element = document.querySelector(
  ".news .news-container"
);

// variables
let cases_data = [],
  recovered_data = [],
  deaths_data = [],
  dates = [],
  formatedDates = [];
// variables for global stats part
let total_cases_data,
  total_recovered_data,
  total_deaths_data,
  new_total_cases_data,
  new_total_recovred_data,
  new_total_deaths_data;
// variables for country news object
let country_news = {
  titles: [],
  url: [],
  img_url: [],
  contents: [],
  sources: [],
  dates: [],
};

// get users country code
let country_code = geoplugin_countryCode();
let user_country, user_country_code;

country_list.forEach((country) => {
  if (country.code == country_code) {
    user_country = country.name;
  }
});

// for fetching api
function fetchData(country) {
  user_country = country;
  country_name_element.innerHTML = "Loading...";

  //evrytime run this method, all variables will reset first.
  (cases_data = []),
    (recovered_data = []),
    (deaths_data = []),
    (dates = []),
    (formatedDates = []);

  (total_cases_data = ""),
    (total_recovered_data = ""),
    (total_deaths_data = ""),
    (new_total_cases_data = ""),
    (new_total_recovred_data = ""),
    (new_total_deaths_data = "");

  country_news = {
    titles: [],
    url: [],
    img_url: [],
    contents: [],
    sources: [],
    dates: [],
  };

  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  const api_fetch = async (country) => {
    //for the total cases
    await fetch(
      "https://api.covid19api.com/total/country/" +
        country +
        "/status/confirmed",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          dates.push(entry.Date);
          cases_data.push(entry.Cases);
        });
      });
    //for the recovered cases
    await fetch(
      "https://api.covid19api.com/total/country/" +
        country +
        "/status/recovered",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          recovered_data.push(entry.Cases);
        });
      });
    //for the deaths cases
    await fetch(
      "https://api.covid19api.com/total/country/" + country + "/status/deaths",
      requestOptions
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        data.forEach((entry) => {
          deaths_data.push(entry.Cases);
        });
      });

    //for the global stats
    await fetch("https://api.covid19api.com/summary", requestOptions)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        total_cases_data = data.Global.TotalConfirmed.toString().replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );
        new_cases_data = data.Global.NewConfirmed.toString().replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );
        total_recovered_data = data.Global.TotalRecovered.toString().replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );
        new_total_recovred_data = data.Global.NewRecovered.toString().replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );
        total_deaths_data = data.Global.TotalDeaths.toString().replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );
        new_total_deaths_data = data.Global.NewDeaths.toString().replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );
      });

    //for fetching country news.
    country_list.forEach((data) => {
      if (country === data.name) {
        console.log(data.code);
        fetch(
          `https://newsapi.org/v2/top-headlines?country=${data.code.toLowerCase()}&category=health&apiKey=996f4ea38980427e806b8f9d3b8e1eca`,
          requestOptions
        )
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            for (let i = 0; i < 6; i++) {
              country_news.titles.push(data.articles[i].title);
              country_news.sources.push(data.articles[i].source.name);
              country_news.dates.push(data.articles[i].publishedAt);
              country_news.contents.push(data.articles[i].content);
              country_news.img_url.push(data.articles[i].urlToImage);
              country_news.url.push(data.articles[i].url);
              //console.log(country_news.titles);
            }
            showNews();
          }).catch(err => {
              alert(err);
              clearNews();
          });
      }
    });
    updateUI();
  };

  api_fetch(country);
}

fetchData(user_country);

//update ul function
function updateUI() {
  updateStats();
  axesLinearChart();
}

function updateStats() {
  const new_confirmed_cases =
    cases_data[cases_data.length - 1] - cases_data[cases_data.length - 2];

  const new_recovered_cases =
    recovered_data[recovered_data.length - 1] -
    recovered_data[recovered_data.length - 2];

  const new_deaths_cases =
    deaths_data[deaths_data.length - 1] - deaths_data[deaths_data.length - 2];

  //for the total cases and new cases showing on the screen.
  country_name_element.innerHTML = user_country;
  total_cases_element.innerHTML = cases_data[cases_data.length - 1]
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  new_cases_element.innerHTML = `+${new_confirmed_cases
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  //for the total recovered and new recovered cases on the screen.
  recovered_cases_element.innerHTML = recovered_data[recovered_data.length - 1]
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  new_recovered_cases_element.innerHTML = `+${new_recovered_cases
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  //for the total deaths cases and new deaths cases on the screen.
  death_cases_element.innerHTML = deaths_data[deaths_data.length - 1]
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  new_death_cases_element.innerHTML = `+${new_deaths_cases
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  //format dates
  dates.forEach((date) => {
    formatedDates.push(formateDate(date));
  });

  //for the global stats part
  global_total_cases_element.innerHTML = total_cases_data;
  global_new_total_cases_element.innerHTML = `+${new_cases_data}`;

  global_recovered_cases_element.innerHTML = total_recovered_data;
  global_new_recovred_cases_element.innerHTML = `+${new_total_recovred_data}`;

  global_deaths_cases_element.innerHTML = total_deaths_data;
  global_new_deaths_cases_element.innerHTML = `+${new_total_deaths_data}`;

  //for country name display
  country_new_name_element.innerHTML = "Top news for " + user_country;
}

//for updating chart.
let my_chart;
function axesLinearChart() {
  if (my_chart) {
    my_chart.destroy();
  }

  my_chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Cases",
          data: cases_data,
          fill: false,
          borderColor: "#f25f4c",
          backgroundColor: "#f25f4c",
          borderWidth: 1,
        },

        {
          label: "Recovered",
          data: recovered_data,
          fill: false,
          borderColor: "#4be9bc",
          backgroundColor: "#4be9bc",
          borderWidth: 1,
        },

        {
          label: "Deaths",
          data: deaths_data,
          fill: false,
          borderColor: "#0f0e17",
          backgroundColor: "#0f0e17",
          borderWidth: 1,
        },
      ],
      labels: formatedDates,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      color: "#000",
    },
  });
}

// for formatting date
const monthsNames = [
  "Jan",
  "Feb",
  "March",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formateDate(dateString) {
  let date = new Date(dateString);

  return `${date.getDate()} ${monthsNames[date.getMonth()]}`;
}

//for creating news html elements part
function showNews() {
  //for creating news html elements part second option.
  const values = Object.values(country_news);
  clearNews();
  if (values.length > 1) {
    for (let i = 0; i < 6; i++) {
      country_news_title_element.innerHTML += `<div id='${i}' class="new-box"></div>`;
      document.getElementById(`${i}`).innerHTML += `<a href="${
        values[1][i]
      }"><h4>${i + 1 + ". " + values[0][i]}</h4></a>`;
      document.getElementById(
        `${i}`
      ).innerHTML += `<a href="${values[1][i]}"><img src="${values[2][i]}" class="news-img"/></a>`;
    }
  }
}
function clearNews() {
  country_news_title_element.innerHTML = ``;
}
