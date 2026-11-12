let chart = null;

let actionUsedToday = false;


async function api(url, options = {}) {

    const response = await fetch(url, {

        headers: {
            "Content-Type": "application/json"
        },

        ...options

    });

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.error || "Request failed"
        );

    }

    return data;

}


function render(state) {

    document.getElementById("game").hidden =
        state.status === "NOT_STARTED";

    document.getElementById("dayNumber").textContent =
        state.current_day;


    ["power", "oxygen", "water", "food"].forEach(resource => {

        const value = state.resources[resource];

        document.getElementById(
            resource + "Value"
        ).textContent = Math.round(value) + "%";

        document.getElementById(
            resource + "Bar"
        ).style.width = value + "%";

    });


    document.getElementById("feedbackText").textContent =
        state.feedback;


    const eventBox = document.getElementById("eventBox");

    eventBox.hidden = !state.current_event;

    if (state.current_event) {

        eventBox.textContent =
            state.current_event.title + ": " +
            state.current_event.description + " " +
            state.current_event.explanation;

    }


    document.querySelectorAll(".actions button").forEach(button => {

        button.disabled =
            state.status !== "ACTIVE" || actionUsedToday;

    });


    document.getElementById("advanceBtn").disabled =
        state.status !== "ACTIVE";


    updateChart(state.resource_history || []);


    updateLog(state);


    if (
        state.status === "SUCCESS" ||
        state.status === "FAILED"
    ) {

        showReport();

    }

}


function updateChart(history) {

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

    if (chart) {

        chart.destroy();

    }

    const canvas = document.getElementById("resourceChart");

    if (window.Chart) {

        chart = new Chart(canvas, {

            type: "line",

            data: {

                labels: labels,

                datasets: datasets

            },

            options: {

                responsive: true,

                scales: {

                    y: {
                        min: 0,
                        max: 100
                    }

                }

            }

        });

    }

}


function updateLog(state) {

    const items = [];

    state.action_history.slice(-3).reverse().forEach(item => {

        items.push(
            `Day ${item.day}: ${item.title}`
        );

    });

    state.event_history.slice(-3).reverse().forEach(item => {

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


async function showReport() {

    try {

        const report = await api(
            "/api/mission/report"
        );

        document.getElementById("game").hidden = true;

        document.getElementById("report").hidden = false;

        document.getElementById("reportTitle").textContent =
            report.status === "SUCCESS"
                ? "🏆 MISSION SUCCESS!"
                : "MISSION FAILED";


        document.getElementById("reportSummary").textContent =
            `Your crew survived ${report.days_survived} of ${report.mission_duration} days.`;


        const resources = document.getElementById("reportResources");

        resources.innerHTML = "";

        Object.entries(report.resources).forEach(([key, value]) => {

            const div = document.createElement("div");

            div.textContent =
                `${key.toUpperCase()}: ${Math.round(value)}%`;

            resources.appendChild(div);

        });


        document.getElementById("lessonsList").innerHTML =
            report.lessons.map(
                item => `<li>${escapeHtml(item)}</li>`
            ).join("");


        document.getElementById("reportEvents").innerHTML =
            report.events.length
                ? report.events.map(
                    item => `<li>Day ${item.day}: ${escapeHtml(item.title)}</li>`
                ).join("")
                : "<li>No major events occurred.</li>";

    } catch (error) {

        alert(error.message);

    }

}


function escapeHtml(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"

    })[character]);

}


async function loadMarsImage() {

    try {

        const data = await api("/api/images/mars");

        const image = document.getElementById("marsImage");

        image.src = data.image_url;

        image.alt = data.title || "Mars image";

    } catch (error) {

        console.log("NASA image unavailable. Using fallback.");

    }

}


document.getElementById("startBtn").addEventListener(
    "click",
    async () => {

        try {

            const state = await api(
                "/api/mission/start",
                {method: "POST"}
            );

            actionUsedToday = false;

            document.getElementById("report").hidden = true;

            render(state);

        } catch (error) {

            alert(error.message);

        }

    }
);


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

        } catch (error) {

            alert(error.message);

        }

    });

});


document.getElementById("advanceBtn").addEventListener(
    "click",
    async () => {

        try {

            const result = await api(
                "/api/mission/advance",
                {method: "POST"}
            );

            actionUsedToday = false;

            render(result.state);

        } catch (error) {

            alert(error.message);

        }

    }
);


document.getElementById("restartBtn").addEventListener(
    "click",
    async () => {

        actionUsedToday = false;

        document.getElementById("report").hidden = true;

        const state = await api(
            "/api/mission/start",
            {method: "POST"}
        );

        render(state);

    }
);



/*==================================
       ASTRONAUT MOVEMENT SYSTEM
==================================*/

const astronaut = document.getElementById("astronaut");
const gameWorld = document.getElementById("gameWorld");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

let astronautPosition = 10;
let movingLeft = false;
let movingRight = false;
let lastFrameTime = 0;

const movementSpeed = 0.25;

// Check that all required elements exist
if (astronaut && gameWorld && leftBtn && rightBtn) {

    // KEYBOARD CONTROLS
    document.addEventListener("keydown", function(event) {

        if (document.getElementById("game")?.hidden) return;

        const key = event.key.toLowerCase();

        if (["arrowleft", "arrowright", "a", "d"].includes(key)) {
            event.preventDefault();
        }

        if (key === "arrowright" || key === "d") {
            movingRight = true;
            astronaut.style.transform = "scaleX(1)";
        }

        if (key === "arrowleft" || key === "a") {
            movingLeft = true;
            astronaut.style.transform = "scaleX(-1)";
        }

    });


    // STOP KEYBOARD MOVEMENT
    document.addEventListener("keyup", function(event) {

        const key = event.key.toLowerCase();

        if (key === "arrowright" || key === "d") {
            movingRight = false;
        }

        if (key === "arrowleft" || key === "a") {
            movingLeft = false;
        }

    });


    // BUTTON CONTROLS
    function startMoving(direction) {

        movingLeft = direction === "left";
        movingRight = direction === "right";

        astronaut.style.transform =
            direction === "left" ? "scaleX(-1)" : "scaleX(1)";
    }

    function stopMoving() {
        movingLeft = false;
        movingRight = false;
    }

    leftBtn.addEventListener("pointerdown", () => startMoving("left"));
    rightBtn.addEventListener("pointerdown", () => startMoving("right"));

    [leftBtn, rightBtn].forEach(button => {
        button.addEventListener("pointerup", stopMoving);
        button.addEventListener("pointerleave", stopMoving);
        button.addEventListener("pointercancel", stopMoving);
    });


    // ANIMATION SYSTEM
    function animateAstronaut(timestamp) {

        if (!lastFrameTime) {
            lastFrameTime = timestamp;
        }

        const deltaTime = Math.min(timestamp - lastFrameTime, 50);
        lastFrameTime = timestamp;

        const game = document.getElementById("game");

        if (!game || !game.hidden) {

            if (movingRight) {
                astronautPosition += movementSpeed * deltaTime;
            }

            if (movingLeft) {
                astronautPosition -= movementSpeed * deltaTime;
            }

            const maxPosition = Math.max(
                0,
                gameWorld.clientWidth - astronaut.offsetWidth
            );

            astronautPosition = Math.max(
                0,
                Math.min(astronautPosition, maxPosition)
            );

            astronaut.style.left = astronautPosition + "px";

            astronaut.classList.toggle(
                "walking",
                movingLeft || movingRight
            );
        }

        requestAnimationFrame(animateAstronaut);
    }

    requestAnimationFrame(animateAstronaut);

}