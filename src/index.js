import _ from "lodash";
// Funcion que recibe latitud y longitud y devuelve la informacion de la posición.
async function getTiempo(lat, lng) {
  let texto = "";
  let url = `https://api.weatherapi.com/v1/current.json?key=4369d84d566d474996394747230202&q=${lat} , ${lng}&aqi=no`;
  let response = await (await fetch(url, { method: "GET" })).json();
  console.log(response);
  texto = `-Name: ${response.location.name} || -Region: ${
    response.location.region
  } || -Country: ${response.location.country} || -Local Time : ${
    response.location.localtime
  } || Time: ${response.current.condition.text} || Day : ${
    response.current.is_day == 1 ? "yes" : "no"
  } || Humidity : ${response.current.humidity} || Temperature : ${
    response.current.temp_c
  } ||`;
  return texto;
}

// Comprobacion de API

if ("geolocation" in navigator) {
  // Getting the position
  navigator.geolocation.getCurrentPosition(
    // Success action
    function (posicion) {
      // Getting session info
      let info = window.sessionStorage;
      let marcadores = JSON.parse(info.getItem("marcadores") ?? "[]");
      // Map
      const { latitude, longitude } = posicion.coords;
      const map = L.map("map").setView([latitude, longitude], 15);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      let popup = L.popup();
      // Funcion que recibe la información almacenada en la sessionStorage y llena la lista y le mapa con los marcadores.
      function fillList(marcadores) {
        let ul = document.getElementById("unorderlist");
        for (let a = 0; a < marcadores.length; a++) {
          ul.children[a].firstElementChild.innerHTML = marcadores[a].texto;
          let marker = L.marker();
          let texto = marcadores[a].tiempo;
          marker
            .setLatLng(L.latLng(marcadores[a].lat, marcadores[a].lng))
            .bindPopup(texto)
            .openPopup()
            .addTo(map);
        }
      }
      function centerInMap(texto, marcadores) {
        for (let a = 0; a < marcadores.length; a++) {
          if (marcadores[a].texto == texto) {
            map.setView([marcadores[a].lat, marcadores[a].lng], 15);
            break;
          }
        }
      }
      document
        .getElementById("unorderlist")
        .addEventListener("click", function (event) {
          centerInMap(event.target.textContent, marcadores);
        });
      fillList(marcadores);

      // Funcion recive evento , recive el timepo y genera un marcador con informacion metereologica que almacena en sessionStorage marcadores.
      // event -> onMapClick -> sessionStorage(marcador)
      async function onMapClick(e) {
        let texto = "";
        let tiempo = "";
        tiempo = await getTiempo(e.latlng.lat, e.latlng.lng);
        let markerName = document.getElementById("markerName");
        let markerButtom = document.getElementById("markerButtom");
        markerName.value = "";
        document.getElementById("markerForm").classList.remove("z-0");
        document.getElementById("markerForm").classList.add("z-3");
        markerName.focus();
        markerButtom.onclick = () => {
          texto = markerName.value;
          document.getElementById("markerForm").classList.remove("z-3");
          document.getElementById("markerForm").classList.add("z-0");
          marcadores = [
            ...marcadores,
            {
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              texto: texto,
              tiempo: tiempo,
            },
          ];
          info.setItem("marcadores", JSON.stringify(marcadores));
          fillList(marcadores);
        };
        markerName.addEventListener("keypress", function (event) {
          if (event.key === "Enter") {
            texto = markerName.value;
            document.getElementById("markerForm").classList.remove("z-3");
            document.getElementById("markerForm").classList.add("z-0");
            marcadores = [
              ...marcadores,
              {
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                texto: texto,
                tiempo: tiempo,
              },
            ];
            info.setItem("marcadores", JSON.stringify(marcadores));
            fillList(marcadores);
          }
        });
      }
      map.on("click", onMapClick);
    },
    // Error action
    function (err) {
      console.log(err);
    }
  );
} else {
  console.log("Geolocation is not available");
}
