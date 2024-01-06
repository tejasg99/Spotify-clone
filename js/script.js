let currentSong = new Audio();
const play1 = document.getElementById("play1");
let songs;
let currFolder;
function SecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return "00:00";
    }
  
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
  
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
  }

async function getSongs(folder){
    currFolder = folder;
    let a =await fetch(`./${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs=[];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    console.log(songs)
    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <img class="invert" src="img/music.svg" alt=""/>
            <div class="info">
            <div>${song.replaceAll("%20"," ")}</div>
            </div>
            <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="img/play2.svg" alt=""/>
            </div>
        </li>`;
    }
    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        
    })
    return songs
}

const playMusic = (track,pause=false)=>{
    //Error 404 rectified by replacing the correct location of file
    // let audio = new Audio(`http://127.0.0.1:3000/Exercises/Spotify%20clone%20project/songs/${track}`)
    currentSong.src = `./${currFolder}/`+ track;
    if(!pause){
       currentSong.play()
       play1.src = "./img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
    
}

async function displayAlbums(){
    let a =await fetch(`./songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++){
            const e = array[index];
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            //to get the folder names
            let folder = (e.href.split("/").slice(-2)[0])
            //Get the metadata of the folder
            let a = await fetch(`songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
              <svg
                height="25px"
                style="enable-background: new 0 0 24 32"
                version="1.1"
                viewBox="0 0 24 32"
                width="24px"
                xml:space="preserve"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
              >
                <g id="Layer_1" />
                <g id="play">
                  <polygon points="0,0 24,16 0,32  " style="fill: #111112" />
                </g>
              </svg>
            </div>
            <img
              src="songs/${folder}/Cover.jpg"
              alt=""
            />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`
        }
    }
    //Load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
           songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
           playMusic(songs[0])
        })   
       })
}

async function main(){
    //Get the list of all songs
    await getSongs("songs/Joyous-Hits")
    playMusic(songs[0],true)

    //Display all the albums on the page
    displayAlbums()
    
    //Attach an event listener to play, next and previous
    play1.addEventListener("click",()=>{
       if(currentSong.paused){
        currentSong.play()
        play1.src = "./img/pause.svg"
       }
       else{
        currentSong.pause()
        play1.src ="./img/play1.svg"
       } 
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", ()=>{
    document.querySelector(".songtime").innerHTML = `${SecondsToMinutesSeconds(currentSong.currentTime)}/${SecondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime/ currentSong.duration) * 100 +"%";
    })
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent +"%";
        currentSong.currentTime = ((currentSong.duration) * percent)/100;
    })
    //Add an event listener for hamburger menu
    //Open menu
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })
    //Close menu
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-120%"
    })
    //Add an event listener to previous and next
    previous.addEventListener("click",()=>{
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })
    next.addEventListener("click",()=>{
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1)<(songs.length)){
            playMusic(songs[index+1])
        }
    })
    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume = parseInt(e.target.value)/100
    })
    //Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg") 
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
}
main();
