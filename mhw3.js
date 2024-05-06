function watchlist_button(event) {
    const container = event.currentTarget;
    if (parseInt(container.dataset.clicked)) {
        container.dataset.clicked = '0';
        container.querySelector(".material-symbols-outlined").textContent = "add"
    }
    else {
        container.dataset.clicked = '1';
        container.querySelector(".material-symbols-outlined").textContent = "done"
    }
}

function mostra_ancora() {

    const carousel = document.querySelector("#continua").cloneNode(true);  //non sapevo come implementare questa funzione nel sito che non sembra possederla, quindi ho fatto così per mostrare comunque di aver compreso l'utilizzo, anche se logicamente non ha senso aggiungere un carosello clonato
    carousel.addEventListener('mouseover', show);
    carousel.addEventListener('mouseout', hide);
    document.querySelector(".main").appendChild(carousel);
    const poster = carousel.querySelectorAll(".poster");
    for (const elem of poster) {
        elem.addEventListener('mouseover', display);
        elem.addEventListener('mouseout', un_display);
    }
    const watchlist = document.querySelectorAll(".watchlist");
    for (const elem of watchlist) {
    elem.addEventListener('click', watchlist_button);
}

}

function show(event, classe) {
    const target = event.currentTarget.querySelector(".vedi");
    target.classList.add("showing")
}

function hide(event, classe) {
    const target = event.currentTarget.querySelector(".vedi");
    target.classList.remove("showing");
}

function display(event) { 
    const target = event.currentTarget.querySelector(".poster_drop");
    target.classList.add("display");
}

function un_display(event) { 
    const target = event.currentTarget.querySelector(".poster_drop");
    target.classList.remove("display")
}

function img_gif(event) { 

    const target = event.currentTarget.querySelector("img");
    const string = target.src;

    switch (string.slice(-3)) {
        case "jpg":
            target.src = string.slice(0, -3).concat("gif");
            break;
        case "gif":
            target.src = string.slice(0, -3).concat("jpg");
            break;
        default:
            break;
    }

}

function barra_ricerca(event) {
    const target = event.currentTarget;
    target.querySelector(".cerca_risultati").style.display = "flex"
    target.style.backgroundColor = "rgba(155, 155, 155, 0.686)";
    event.stopPropagation();
    document.querySelector("body").addEventListener('click', barra_ricerca_hide)
}

function barra_ricerca_hide(event) {
    document.querySelector("body").removeEventListener('click', barra_ricerca_hide);
    document.querySelector(".lista_risultati_colonna").style.display = "none";
    document.querySelector(".cerca").style.backgroundColor = "transparent";
    document.querySelector(".cerca_risultati").style.display = "none"
}

const watchlist = document.querySelectorAll(".watchlist");
for (const elem of watchlist) {
    elem.addEventListener('click', watchlist_button);
}

const carousel = document.querySelectorAll(".carousel");
for (const elem of carousel) {
    elem.addEventListener('mouseover', show);
    elem.addEventListener('mouseout', hide);
}

for (const elem of carousel) {
    const poster = document.querySelectorAll("main .poster");
    for (const elem of poster) {
        elem.addEventListener('mouseover', display);
        elem.addEventListener('mouseout', un_display);
        elem.addEventListener('click', img_gif)
    }
}

function onJsonAlbum(json){

    document.querySelector(".lista_risultati_colonna").innerHTML = "";

    const results = json.albums.items;
    let num_results = results.length;
    // Mostriamone al massimo 10
    if(num_results > 10)
        num_results = 5;
    // Processa ciascun risultato
    for(let i=0; i<num_results; i++)
    {
        // Leggi il documento
        const album_data = results[i]

        const album = document.createElement('div');
        const link = document.createElement('a');
        console.log(album_data.external_urls.spotify)
        link.href = album_data.external_urls.spotify;
        link.target = "_blank"
        const cover = document.createElement('img');
        cover.src =  album_data.images[2].url;
        link.appendChild(cover);
        album.appendChild(link);
        const descr = document.createElement('h5');
        descr.innerHTML = album_data.name;
        album.appendChild(descr);

        album.classList.add("risultato_colonna");

        document.querySelector(".lista_risultati_colonna").append(album);

  }

}

function soundtrack_search (event) {

    const target = event.currentTarget;
    document.querySelector(".lista_risultati_colonna").style.display = "block";

    fetch("https://api.spotify.com/v1/search?type=album&q=" + encodeURI(target.parentNode.dataset.title + " film album"),
      {
        headers:
        {
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(onResponse).then(onJsonAlbum);

}

function onJsonID(json) {
    const new_elem = template.cloneNode(true);

    new_elem.style.display = "flex";

    new_elem.querySelector('.poster img').src = "https://image.tmdb.org/t/p/w342" + json.poster_path;
    new_elem.querySelector('.info h3').textContent = json.title;
    for(j = 0; j < json.credits.crew.length; j++) {    
        if(json.credits.crew[j].job == "Director") {
            new_elem.querySelector('.info h4').textContent = json.credits.crew[j].name;
            break
        }
    }
    new_elem.querySelector('.info p').textContent = json.overview;

    new_elem.dataset.title = json.title;

    new_elem.querySelector(".cerca_colonna").addEventListener('click', soundtrack_search)

    document.querySelector(".cerca_risultati").append(new_elem);
}

function onJson(json) {

    document.querySelector(".cerca_risultati").innerHTML = "";
    if(json.results.length != 0){
        var max = json.results.length;
        if(max > 20) max = 20;

        for(i=0; i < max; i++){
            const url = 'https://api.themoviedb.org/3/movie/' + json.results[i].id  + '?append_to_response=credits&language=en-US';
            const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OWViZTU0OGMxZWZmZjM4MGE1MTBlMDAwZWM2MzliNiIsInN1YiI6IjY2MzJkNTg5YzYxNmFjMDEyYTE4YjQwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.H-1akhqpT9RtKjqe4TFsJUh-uDPOqY4a_pwFwID0wxY'
            }
            };
            fetch(url, options).then(onResponse).then(onJsonID);
        }
    } else document.querySelector(".cerca_risultati").append(no_film);
}
  
function onResponse(response) {
    return response.json();
}

function search(event) {
    // Impedisci submit
    event.preventDefault();

    const search_value = document.querySelector('#cerca').value;

    const url = 'https://api.themoviedb.org/3/search/movie?query=' + encodeURI(search_value) + '&include_adult=false&language=en-US&page=1';
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2OWViZTU0OGMxZWZmZjM4MGE1MTBlMDAwZWM2MzliNiIsInN1YiI6IjY2MzJkNTg5YzYxNmFjMDEyYTE4YjQwNiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.H-1akhqpT9RtKjqe4TFsJUh-uDPOqY4a_pwFwID0wxY'
    }
    };

    fetch(url, options).then(onResponse).then(onJson);
}

document.querySelector("#ancora").addEventListener('click', mostra_ancora);
document.querySelector(".cerca").addEventListener('click', barra_ricerca);

const template = document.querySelector('.risultato_ricerca').cloneNode(true);
const no_film = document.querySelector('.no_film').cloneNode(true);
const form = document.querySelector("form").addEventListener('submit', search);
  
  function onTokenJson(json)
  {
    token = json.access_token;
  }
  
  function onTokenResponse(response)
  {
    return response.json();
  }
  
  const client_id = 'c248417d618548c88917fff082e35283';
  const client_secret = '65fcd05c566744b998a2633b89d10c8d';
  let token;
  fetch("https://accounts.spotify.com/api/token",
      {
     method: "post",
     body: 'grant_type=client_credentials',
     headers:
     {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
     }
    }
  ).then(onTokenResponse).then(onTokenJson);