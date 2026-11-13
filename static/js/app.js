/* =================================
   GLOBAL VARIABLES
================================= */

let chart = null;

let actionUsedToday = false;

let astronautPosition = 100;
let astronautVerticalPosition = 200;

const activeDirections = new Set();

let cameraPosition = 0;
let movementFrame = null;

const movementSpeed = 3.5;
const astronautWidth = 85;
const astronautHeight = 125;

let lastFrameTime = 0;


/* =================================
   DOM ELEMENTS
================================= */

const landing = document.getElementById("landing");

const game = document.getElementById("game");

const reportSection = document.getElementById("report");

const explorationScreen = document.getElementById("explorationScreen");

const dashboardScreen = document.getElementById("dashboardScreen");

const astronaut = document.getElementById("astronaut");

const gameWorld = document.getElementById("gameWorld");

const sceneTrack = document.getElementById("sceneTrack");

const dustLayer = document.getElementById("dustLayer");

const warningBanner = document.getElementById("warningBanner");

const weatherText = document.getElementById("weatherText");

const locationInfo = document.getElementById("locationInfo");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");




/* =================================
   API SYSTEM
================================= */

async function api(url, options = {}) {

    const response = await fetch(url, {

        headers: {
            "Content-Type": "application/json"
        },

        ...options

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(data.error || "Request failed");

    }

    return data;
}


/* =================================
   SCREEN NAVIGATION
================================= */

function showExploration() {

    explorationScreen.hidden = false;

    dashboardScreen.hidden = true;

    locationInfo.hidden = true;

    // Clear any previous movement
    stopMoving();

    // Reset animation state
    movementFrame = null;
    lastFrameTime = 0;

}

function showDashboard() {

    explorationScreen.hidden = true;

    dashboardScreen.hidden = false;

    stopMoving();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


document.getElementById("dashboardBtn").addEventListener(
    "click",
    showDashboard
);


document.getElementById("backToExploreBtn").addEventListener(
    "click",
    showExploration
);


/* =================================
   DUST PARTICLES
================================= */

function createDustParticles() {

    if (!dustLayer) return;

    dustLayer.innerHTML = "";

    for (let i = 0; i < 45; i++) {

        const particle = document.createElement("div");

        particle.className = "dust-particle";

        const size = Math.random() * 5 + 2;

        const duration = Math.random() * 8 + 5;

        const delay = Math.random() * 8;

        const verticalPosition = Math.random() * 100;

        particle.style.setProperty(
            "--particle-size",
            size + "px"
        );

        particle.style.setProperty(
            "--particle-duration",
            duration + "s"
        );

        particle.style.setProperty(
            "--particle-delay",
            -delay + "s"
        );

        particle.style.setProperty(
            "--particle-y",
            verticalPosition + "%"
        );

        dustLayer.appendChild(particle);

    }

}

/* =================================
   ASTRONAUT FREE MOVEMENT
================================= */

function resetAstronaut() {

    if (!astronaut || !sceneTrack || !gameWorld) return;

    astronautPosition = 100;

    astronautVerticalPosition =
        Math.max(75, gameWorld.clientHeight - 200);

    cameraPosition = 0;

    activeDirections.clear();

    astronaut.style.left = astronautPosition + "px";
    astronaut.style.top = astronautVerticalPosition + "px";

    sceneTrack.style.transform = "translateX(0px)";

    astronaut.classList.remove("walking", "facing-left");

    if (movementFrame) {
        cancelAnimationFrame(movementFrame);
        movementFrame = null;
    }
}


function startMoving(direction) {

    if (game.hidden) return;
    if (!dashboardScreen.hidden) return;
    // if (locationInfo && !locationInfo.hidden) return;

    activeDirections.add(direction);

    astronaut.classList.add("walking");

    if (direction === "left") {
        astronaut.classList.add("facing-left");
    }

    if (direction === "right") {
        astronaut.classList.remove("facing-left");
    }

    // Always restart animation if it is not running
    if (!movementFrame) {
        lastFrameTime = 0;
        movementFrame = requestAnimationFrame(moveAstronaut);
    }
}


function stopMoving(direction) {

    if (direction) {
        activeDirections.delete(direction);
    } else {
        activeDirections.clear();
    }

    if (activeDirections.size === 0) {

        astronaut.classList.remove("walking");

        if (movementFrame) {
            cancelAnimationFrame(movementFrame);
            movementFrame = null;
        }
    }
}


function moveAstronaut() {

    movementFrame = null;

    if (
        game.hidden ||
        !dashboardScreen.hidden ||
        !astronaut ||
        !sceneTrack ||
        !gameWorld
    ) {
        stopMoving();
        return;
    }

    const sceneWidth = sceneTrack.scrollWidth;
    const viewportWidth = gameWorld.clientWidth;
    const viewportHeight = gameWorld.clientHeight;

    // Horizontal movement
    if (activeDirections.has("left")) {
        astronautPosition -= movementSpeed;
    }

    if (activeDirections.has("right")) {
        astronautPosition += movementSpeed;
    }

    // Vertical movement
    if (activeDirections.has("up")) {
        astronautVerticalPosition -= movementSpeed;
    }

    if (activeDirections.has("down")) {
        astronautVerticalPosition += movementSpeed;
    }

    // Keep astronaut inside the world
    astronautPosition = Math.max(
        0,
        Math.min(
            astronautPosition,
            sceneWidth - astronautWidth
        )
    );

    astronautVerticalPosition = Math.max(
        65,
        Math.min(
            astronautVerticalPosition,
            viewportHeight - astronautHeight - 10
        )
    );

    astronaut.style.left = astronautPosition + "px";

    astronaut.style.top =
        astronautVerticalPosition + "px";

    // Camera follows astronaut horizontally
    const targetCamera =
        astronautPosition - viewportWidth * 0.4;

    cameraPosition = Math.max(
        0,
        Math.min(
            targetCamera,
            sceneWidth - viewportWidth
        )
    );

    sceneTrack.style.transform =
        `translateX(-${cameraPosition}px)`;

    // Update direction
    if (activeDirections.has("left")) {
        astronaut.classList.add("facing-left");
    }

    if (activeDirections.has("right")) {
        astronaut.classList.remove("facing-left");
    }

    if (activeDirections.size > 0) {
        movementFrame = requestAnimationFrame(moveAstronaut);
    } else {
        astronaut.classList.remove("walking");
    }

}

/* =================================
   TOUCH MOVEMENT CONTROLS
================================= */

function setupMovementButton(buttonId, direction) {

    const button = document.getElementById(buttonId);

    if (!button) return;

    button.addEventListener("pointerdown", event => {

        event.preventDefault();

        button.setPointerCapture(event.pointerId);

        startMoving(direction);

    });

    button.addEventListener("pointerup", () => {
        stopMoving(direction);
    });

    button.addEventListener("pointercancel", () => {
        stopMoving(direction);
    });

    button.addEventListener("lostpointercapture", () => {
        stopMoving(direction);
    });

}


setupMovementButton("leftBtn", "left");
setupMovementButton("rightBtn", "right");
setupMovementButton("upBtn", "up");
setupMovementButton("downBtn", "down");

/* =================================
   KEYBOARD CONTROLS
================================= */

document.addEventListener("keydown", event => {

    const key = event.key.toLowerCase();

    const controls = {
        arrowleft: "left",
        a: "left",

        arrowright: "right",
        d: "right",

        arrowup: "up",
        w: "up",

        arrowdown: "down",
        s: "down"
    };

    const direction = controls[key];

    if (direction) {
        event.preventDefault();
        startMoving(direction);
    }

});


document.addEventListener("keyup", event => {

    const key = event.key.toLowerCase();

    const controls = {
        arrowleft: "left",
        a: "left",

        arrowright: "right",
        d: "right",

        arrowup: "up",
        w: "up",

        arrowdown: "down",
        s: "down"
    };

    const direction = controls[key];

    if (direction) {
        stopMoving(direction);
    }

});


window.addEventListener("blur", () => stopMoving());
/* =================================
   MARS LOCATION INFORMATION
================================= */

const locationDetails = {

    habitat: {

        title: "🏠 Mars Habitat",

        description:
            "Welcome to your Mars home! The habitat protects astronauts from extreme temperatures, radiation and the thin Martian atmosphere."

    },

    greenhouse: {

        title: "🌱 Food Greenhouse",

        description:
            "Plants can be grown inside a controlled environment. They provide food and help support a sustainable Mars mission."

    },

    power: {

        title: "⚡ Electricity Station",

        description:
            "Solar panels collect sunlight and generate electricity for lighting, heating, communication and scientific equipment."

    },

    water: {

        title: "💧 Water Recycling Station",

        description:
            "Water recycling systems recover and clean water so astronauts can reuse it for drinking, hygiene and growing plants."

    },

    oxygen: {

        title: "🫧 Oxygen Station",

        description:
            "The life-support system supplies breathable oxygen and helps astronauts stay safe inside the Mars habitat."

    },

    rover: {

        title: "🚙 Exploration Rover",

        description:
            "The Mars rover helps astronauts explore the surface, collect samples and investigate interesting geological locations."

    }

};


/* =================================
   MARS STATION SELECTION
================================= */

document.querySelectorAll(".mars-location").forEach(button => {

    button.addEventListener("click", () => {

        const location = button.dataset.location;

        // Change background to selected station
        showStationBackground(button);

        // Stop astronaut while selecting a station
        stopMoving();

        const details = locationDetails[location];

        if (!details) return;

        document.getElementById("locationTitle").textContent =
            details.title;

        document.getElementById("locationDescription").textContent =
            details.description;

        locationInfo.hidden = false;

    });

});


/* Close station information */

document.getElementById("closeLocationBtn").addEventListener(
    "click",
    () => {

        locationInfo.hidden = true;

    }
);

/* =================================
   WEATHER SYSTEM
================================= */

function updateWeather(weather) {

    if (!gameWorld) return;

    const weatherClasses = [

        "clear-weather",

        "light-dust",

        "dust-storm",

        "severe-storm"

    ];


    gameWorld.classList.remove(...weatherClasses);


    const weatherClass = {

        clear: "clear-weather",

        light_dust: "light-dust",

        dust_storm: "dust-storm",

        severe_storm: "severe-storm"

    };


    gameWorld.classList.add(
        weatherClass[weather] || "clear-weather"
    );


    const weatherNames = {

        clear: "CLEAR",

        light_dust: "LIGHT DUST",

        dust_storm: "DUST STORM",

        severe_storm: "SEVERE DUST STORM"

    };


    weatherText.textContent =
        weatherNames[weather] || "CLEAR";

}


/* =================================
   WARNING SYSTEM
================================= */

function updateWarnings(state) {

    const resources = state.resources;

    const oxygen = resources.oxygen;

    const power = resources.power;

    const warnings = [];


    document.body.classList.remove(
        "low-oxygen",
        "critical-oxygen"
    );


    gameWorld.classList.remove("power-critical");


    if (oxygen <= 15) {

        document.body.classList.add("critical-oxygen");

        document.body.classList.add("low-oxygen");

        warnings.push(
            "🚨 CRITICAL OXYGEN LEVEL! REPAIR LIFE SUPPORT!"
        );

    }

    else if (oxygen <= 30) {

        document.body.classList.add("low-oxygen");

        warnings.push(
            "⚠ LOW OXYGEN! CONSERVE OXYGEN SUPPLY!"
        );

    }


    if (power <= 20) {

        gameWorld.classList.add("power-critical");

        warnings.push(
            "⚡ CRITICAL POWER LEVEL!"
        );

    }


    if (resources.water <= 15) {

        warnings.push(
            "💧 CRITICAL WATER SUPPLY!"
        );

    }


    if (resources.food <= 15) {

        warnings.push(
            "🥫 CRITICAL FOOD SUPPLY!"
        );

    }


    warningBanner.hidden = warnings.length === 0;

    warningBanner.textContent = warnings.join(" | ");

}


/* =================================
   WARNING SOUND
================================= */

function playWarningSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const context = new AudioContext();

        const oscillator = context.createOscillator();

        const gain = context.createGain();

        oscillator.connect(gain);

        gain.connect(context.destination);

        oscillator.frequency.value = 650;

        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.12,
            context.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.35
        );

        oscillator.start();

        oscillator.stop(context.currentTime + 0.35);

    }

    catch (error) {

        console.log("Audio unavailable.");

    }

}


/* =================================
   RESOURCE DISPLAY
================================= */

function updateResources(resources) {

    ["power", "oxygen", "water", "food"].forEach(resource => {

        const value = resources[resource];

        const rounded = Math.round(value);

        document.getElementById(
            resource + "Value"
        ).textContent = rounded + "%";


        const bar = document.getElementById(
            resource + "Bar"
        );

        bar.style.width = Math.max(
            0,
            Math.min(100, value)
        ) + "%";


        if (value <= 20) {

            bar.style.background = "#dc2626";

        }

        else if (value <= 40) {

            bar.style.background = "#f59e0b";

        }

        else {

            bar.style.background = "#22c55e";

        }

    });

}


/* =================================
   EVENT DISPLAY
================================= */

function updateEvent(state) {

    const eventBox = document.getElementById("eventBox");

    const event = state.current_event;

    if (!event) {
        eventBox.hidden = true;
        return;
    }

    const title = event.title || "Mission Update";
    const description = event.description || "";
    const explanation = event.explanation || "";

    eventBox.textContent =
        "🚨 " + title + ": " +
        description + " " +
        explanation;

    eventBox.hidden = false;
}



/* =================================
   MISSION LOG
================================= */

function updateLog(state) {

    const items = [];


    (state.action_history || []).slice(-3).reverse().forEach(item => {

        items.push(
            `Day ${item.day}: ${item.title}`
        );

    });


    (state.event_history || []).slice(-3).reverse().forEach(item => {

        items.push(
            `Day ${item.day}: ${item.title}`
        );

    });


    const list = document.getElementById("activityLog");

    list.innerHTML = "";


    (items.length ? items : ["Mission initialized."]).forEach(item => {

        const li = document.createElement("li");

        li.textContent = item;

        list.appendChild(li);

    });

}


/* =================================
   EXISTING RESOURCE GRAPH
================================= */

function updateChart(history) {

    if (!window.Chart) return;

    const labels = history.map(
        item => "Day " + item.day
    );


    const resources = [
        "power",
        "oxygen",
        "water",
        "food"
    ];


    const datasets = resources.map(resource => ({

        label: resource.toUpperCase(),

        data: history.map(
            item => item[resource]
        ),

        borderWidth: 2,

        tension: 0.3

    }));


    const canvas = document.getElementById("resourceChart");

    if (!canvas) return;


    if (chart) {

        chart.destroy();

    }


    chart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: datasets

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            interaction: {
                intersect: false,
                mode: "index"
            },

            plugins: {

                legend: {
                    position: "bottom"
                }

            },

            scales: {

                y: {

                    min: 0,

                    max: 100,

                    title: {
                        display: true,
                        text: "Resource Level (%)"
                    }

                }

            }

        }

    });

}


/* =================================
   MAIN RENDER FUNCTION
================================= */

function render(state) {

    landing.hidden = state.status !== "NOT_STARTED";

    game.hidden = state.status === "NOT_STARTED";

    reportSection.hidden = true;


    if (state.status === "NOT_STARTED") {

        return;

    }


    document.getElementById(
        "dayNumber"
    ).textContent = state.current_day;


    updateResources(state.resources);

    updateWeather(state.weather || "clear");

    updateWarnings(state);

    updateEvent(state);

    updateLog(state);

    updateChart(state.resource_history || []);


    document.getElementById(
        "feedbackText"
    ).textContent = state.feedback;


    document.querySelectorAll(".actions button").forEach(button => {

        button.disabled =
            state.status !== "ACTIVE" || actionUsedToday;

    });


    document.getElementById("advanceBtn").disabled =
        state.status !== "ACTIVE";


    document.getElementById("game").classList.toggle(
        "low-oxygen",
        state.resources.oxygen <= 25
    );

    document.getElementById("game").classList.toggle(
        "low-power",
        state.resources.power <= 15
    );


    if (
        state.status === "SUCCESS" ||
        state.status === "FAILED"
    ) {

        showReport();
        restoreMarsLandscape();

    }
 document.getElementById("quickPower").textContent =
    document.getElementById("powerValue").textContent;

document.getElementById("quickOxygen").textContent =
    document.getElementById("oxygenValue").textContent;

document.getElementById("quickWater").textContent =
    document.getElementById("waterValue").textContent;

document.getElementById("quickFood").textContent =
    document.getElementById("foodValue").textContent;

}


/* =================================
   MISSION REPORT
================================= */

function escapeHtml(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#39;"

    })[character]);

}


async function showReport() {

    try {

        const report = await api(
            "/api/mission/report"
        );
        // Restore original Mars landscape after Day 7
        restoreMarsLandscape();

        // Stop astronaut movement
        stopMoving();

        game.hidden = true;

        landing.hidden = true;

        reportSection.hidden = false;


        document.getElementById(
            "reportTitle"
        ).textContent =

            report.status === "SUCCESS"

                ? "🏆 MISSION SUCCESS!"

                : "MISSION FAILED";


        document.getElementById(
            "reportSummary"
        ).textContent =

            `Your crew survived ${report.days_survived} of ${report.mission_duration} days.`;


        const resources = document.getElementById(
            "reportResources"
        );

        resources.innerHTML = "";


        Object.entries(report.resources).forEach(([key, value]) => {

            const div = document.createElement("div");

            div.textContent =
                `${key.toUpperCase()}: ${Math.round(value)}%`;

            resources.appendChild(div);

        });


        document.getElementById(
            "lessonsList"
        ).innerHTML =

            report.lessons.map(
                item => `<li>${escapeHtml(item)}</li>`
            ).join("");


        document.getElementById(
            "reportEvents"
        ).innerHTML =

            report.events.length

                ? report.events.map(
                    item =>
                        `<li>Day ${item.day}: ${escapeHtml(item.title)}</li>`
                ).join("")

                : "<li>No major events occurred.</li>";


    }

    catch (error) {

        alert(error.message);

    }

}


/* =================================
   START MISSION
================================= */

document.getElementById("startBtn").addEventListener(
    "click",
    async () => {

        try {

            const state = await api(
                "/api/mission/start",
                {
                    method: "POST"
                }
            );


            actionUsedToday = false;

            reportSection.hidden = true;

            showExploration();

            createDustParticles();

            resetAstronaut();

            render(state);

            showExploration();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

        catch (error) {

            alert(error.message);

        }

    }
);


/* =================================
   MISSION ACTIONS
================================= */

document.querySelectorAll(".actions button").forEach(button => {

    button.addEventListener("click", async () => {

        if (actionUsedToday) return;

        try {

            const result = await api(

                "/api/mission/action",

                {

                    method: "POST",

                    body: JSON.stringify({

                        action: button.dataset.action

                    })

                }

            );


            actionUsedToday = true;

            render(result.state);

        }

        catch (error) {

            alert(error.message);

        }

    });

});


/* =================================
   ADVANCE DAY
================================= */

document.getElementById("advanceBtn").addEventListener(
    "click",
    async () => {

        try {

            stopMoving();

            const result = await api(
                "/api/mission/advance",
                {
                    method: "POST"
                }
            );


            actionUsedToday = false;

            render(result.state);

        }

        catch (error) {

            alert(error.message);

        }

    }
);


/* =================================
   RESTART MISSION
================================= */

document.getElementById("restartBtn").addEventListener(
    "click",
    async () => {

        try {

            actionUsedToday = false;

            reportSection.hidden = true;

            const state = await api(
                "/api/mission/start",
                {
                    method: "POST"
                }
            );

            createDustParticles();

            resetAstronaut();

            render(state);

            showExploration();

        }

        catch (error) {

            alert(error.message);

        }

    }
);

/* =================================
   STATION BACKGROUND CHANGE
================================= */

function showStationBackground(button) {

    const gameWorld = document.getElementById("gameWorld");
    const backdrop = document.getElementById("stationBackdrop");

    const stationImage = button.querySelector(".station-image");

    if (!stationImage || !backdrop) return;

    backdrop.style.backgroundImage =
        `url("${stationImage.src}")`;

    gameWorld.classList.add("station-view-active");
}


/* Restore original Mars landscape */

function restoreMarsLandscape() {

    const gameWorld = document.getElementById("gameWorld");
    const backdrop = document.getElementById("stationBackdrop");

    gameWorld.classList.remove("station-view-active");

    backdrop.style.backgroundImage = "";
}

function showStationBackground(button) {

    const gameWorld = document.getElementById("gameWorld");
    const backdrop = document.getElementById("stationBackdrop");

    const stationImage = button.querySelector(".station-image");

    if (!stationImage || !backdrop) return;

    backdrop.style.backgroundImage =
        `url("${stationImage.src}")`;

    gameWorld.classList.add("station-view-active");
}


function restoreMarsLandscape() {

    const gameWorld = document.getElementById("gameWorld");
    const backdrop = document.getElementById("stationBackdrop");

    gameWorld.classList.remove("station-view-active");

    backdrop.style.backgroundImage = "";
}