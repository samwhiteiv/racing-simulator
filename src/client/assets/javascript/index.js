// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
      })
      .catch((err) => {
        console.log('A problem has occurred getting tracks in getTracks(): ', err)
      })

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
    const { target } = event
    
		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(err) {
		console.log("an error shouldn't be possible here: ", err)
	}
}

/**
 * @description Async function controls the flow of the race
 * 
 */
async function handleCreateRace() {
  try {
  const tracks = await getTracks()
  const track = tracks.find(track => track.id === store.track_id)
  const racers = await getRacers() 

  // pass track & racers to renderRaceStartView()
	renderAt('#race', renderRaceStartView(track, racers))
  const { player_id , track_id } = store;
  createRace(player_id, track_id)
    .then((race) => {
      // update the store with the race id
      store.race_id = race.ID - 1
    })
    .then(() => {
      // TODO - call the async function runCountdown
      return runCountdown()
    })
    // TODO - call the async function startRace
    .then(() => {
      startRace(store.race_id)
    })
    // TODO - call the async function runRace
    .then(() => {
      runRace(store.race_id)
    })
    .catch((err) => {
      console.log('An error was thrown during createRace():' , err)
    })
  }
  catch(err) {
    console.log('handleCreateRace() > throw error: ', err)
  }
}

/**
 * @description Function that initiates the race the raceID
 * @params raceID
 */
function runRace(raceID) {
	return new Promise(resolve => {
	// TODO - use Javascript's built in setInterval method to get race info every 500ms
    const getRaceInfo = async () => {
      getRace(raceID)
        .then((raceInfo) => {
          if (raceInfo.status === "in-progress") {
            renderAt('#leaderBoard', raceProgress(raceInfo.positions))
          } else if (raceInfo.status === "finished") {
            clearInterval(raceInfoInterval) // to stop the interval from repeating
            renderAt('#race', resultsView(raceInfo.positions)) // to render the results view
            resolve(raceInfo) // resolve the promise
          }
        })
        .catch((err) => {
          console.log("A problem has occurred with getRace: ", err)
        })
    }
    const raceInfoInterval = setInterval(getRaceInfo, 500, raceID)
  })
  .catch((err) => {
    console.log(`A problem occurred while executing the Promise: `, err)
  })
}

/**
 * @description Async function that handles initiates the countdown
 * 
 */
async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
      // TODO - use Javascript's built in setInterval method to count down once per second
      decrementCountdown = () => {
        if (timer > 0) {
          document.getElementById('big-numbers').innerHTML = --timer;
        } 
        else {
          clearInterval(countDownInterval);
          resolve();
        }
      }
      const countDownInterval = setInterval(decrementCountdown, 1000)
		})
	} catch(error) {
		console.log(error);
	}
}

/**
 * @description Function that handles user racer selection
 * @params click target
 */
function handleSelectPodRacer(target) {
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}
	target.classList.add('selected')
  store.player_id = parseInt(target.id)
}

/**
 * @description Function that handles user track selection
 * @params click target
 */
function handleSelectTrack(target) {
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
  target.classList.add('selected')
  // TODO - save the selected track id to the store
  store.track_id = parseInt(target.id)
}

/**
 * @description Function that handles user accelerate click
 * 
 */
function handleAccelerate() {
  // TODO - Invoke the API call to accelerate
  const storeRaceId = parseInt(store.race_id)
  try {
    accelerate(storeRaceId)
  }
  catch(err) {
    console.log('A problem has occurred in handleAccelerate: ', err)
  }
}

// HTML VIEWS ------------------------------------------------

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3 style="pointer-events: none;">${driver_name}</h3>
			<p style="pointer-events: none;">${top_speed}</p>
			<p style="pointer-events: none;">${acceleration}</p>
			<p style="pointer-events: none;">${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
    <li id="${id}" class="db relative card track">
      <h3 class="db relative" style="pointer-events: none;">${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)
	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race"><button>Start a new race</button></a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>`
	}).join('')

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)
	node.innerHTML = html
}

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

/**
 * @description Async function that makes a fetch call (with error handling!) to the API to get tracks
 * 
 */

async function getTracks() {
  try {
    const response = await fetch(`${SERVER}/api/tracks`)
    return response.json()
  }
  catch(err) {
    console.log('getTracks() > Throw new error: ', err)
  }

}

/**
 * @description Async function that makes a fetch call (with error handling!) to the API to get racers
 * 
 */

async function getRacers() {
  try {
    const response = await fetch(`${SERVER}/api/cars`)
    return response.json()
  }
  catch(err) {
    console.log('getRacers() > Throw new error: ', err)
  }
}

/**
 * @description Function that makes a fetch call (with error handling!) to the API to create the race
 * @params player_id and track_id
 */
function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
  
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => {
    return res.json()
  })
	.catch(err => console.log("Problem with createRace request::", err))
}

/**
 * @description Async function that makes a fetch call (with error handling!) to the API to cget the race information
 * @params race id
 */
async function getRace(id) {
  const idToStr = id.toString()
  try {
    const response = await fetch(`${SERVER}/api/races/${idToStr}`)
    return response.json()
  }
  catch(err) {
    console.log("Problem with getRace request::", err)
  }
}

/**
 * @description Function that makes a fetch call (with error handling!) to the API to start the race
 * @params race_id in store
 */
function startRace(id) {
  const idStr = id.toString();
	return fetch(`${SERVER}/api/races/${idStr}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(response => {
    return response.status
  })
	.catch(err => console.log("A problem has occurred with startRace request::", err))
}

/**
 * @description Async function that makes a fetch call (with error handling!) to the API to accelerate the user's selected car
 * @params race id
 */
async function accelerate(id) {
  const idToStr = id.toString()
  try {
    const response = await fetch(`${SERVER}/api/races/${idToStr}/accelerate`, {
      method: 'POST',
      ...defaultFetchOpts
    })
    return response.status
  }
  catch(err) {
    console.log('An error has occurred with the accelerate API request > catch: ', err)
  }
}

// THEME IT ------------------------------------------------
