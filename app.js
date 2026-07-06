/******************************************************************
 VYOM-COOL AI
 Final Build
 Part 1/3
 Core State + Data Engine + Utilities
******************************************************************/

const App = {
  city: "Ahmedabad",
  data: null,
  activeZone: null,
  activeLayer: "lst",

  simulation: {
    trees: 60,
    coolRoofs: 60,
    reflective: 60,
    blueGreen: 60,
    shade: 60
  },

  gemini: {
    enabled: false,
    apiKey: "",
    model: "gemini-2.5-flash"
  }
};

/******************************************************************
 DOM
******************************************************************/

const $ = selector =>
  document.querySelector(selector);

const $$ = selector =>
  [...document.querySelectorAll(selector)];

const citySelect =
  $("#citySelect");

const zoneSelect =
  $("#zoneSelect");

const selectedZoneLabel =
  $("#selectedZoneLabel");

const cityMap =
  $("#cityMap");

const scenarioMap =
  $("#scenarioMap");

const mapMetrics =
  $("#mapMetrics");

const mapInsight =
  $("#mapInsight p");

const strategyControls =
  $("#strategyControls");

const scenarioQuickStats =
  $("#scenarioQuickStats");

const scenarioTable =
  $("#scenarioTable");

const scenarioInsight =
  $("#scenarioInsight p");

const portfolioTable =
  $("#portfolioTable");

const portfolioImpact =
  $("#portfolioImpact");

const portfolioInsight =
  $("#portfolioInsight p");

const roadmapSteps =
  $("#roadmapSteps");

const budgetRange =
  $("#budgetRange");

const budgetOutput =
  $("#budgetOutput");

const waterSelect =
  $("#waterSelect");

const landSelect =
  $("#landSelect");

const prioritySelect =
  $("#prioritySelect");

const chatLog =
  $("#chatLog");

const chatForm =
  $("#chatForm");

const promptInput =
  $("#promptInput");

const apiKeyInput =
  $("#apiKeyInput");

const saveApiKey =
  $("#saveApiKey");

const apiState =
  $("#apiState");

/******************************************************************
 COLORS
******************************************************************/

const RiskColors = {
  Critical: "#e72d2d",
  High: "#f6781e",
  Moderate: "#ffcc26",
  Low: "#69b84c"
};

/******************************************************************
 STRATEGIES
******************************************************************/

const Strategies = [
  {
    id: "trees",
    name: "Urban Greening",
    emoji: "🌳",
    cooling: 3.8,
    cost: 0.75,
    water: 0.90,
    land: 0.80
  },

  {
    id: "coolRoofs",
    name: "Cool Roofs",
    emoji: "🏠",
    cooling: 2.7,
    cost: 0.55,
    water: 0.10,
    land: 0.10
  },

  {
    id: "reflective",
    name: "Reflective Pavements",
    emoji: "🛣️",
    cooling: 1.9,
    cost: 0.45,
    water: 0.00,
    land: 0.20
  },

  {
    id: "blueGreen",
    name: "Blue-Green Infrastructure",
    emoji: "💧",
    cooling: 4.2,
    cost: 0.95,
    water: 1.00,
    land: 0.70
  },

  {
    id: "shade",
    name: "Shade Infrastructure",
    emoji: "⛱️",
    cooling: 1.5,
    cost: 0.35,
    water: 0.00,
    land: 0.20
  }
];

/******************************************************************
 HELPERS
******************************************************************/

function numberFormat(value) {
  return new Intl.NumberFormat(
    "en-IN"
  ).format(
    Math.round(value)
  );
}

function riskColor(risk) {
  return (
    RiskColors[risk] ||
    "#69b84c"
  );
}

function calculateCACPI(zone) {

  const lst =
    (zone.lst / 50) * 100;

  const vegetation =
    (1 - zone.ndvi) * 100;

  const population =
    (
      zone.population_density /
      18000
    ) * 100;

  const builtup =
    zone.builtup;

  const vulnerability =
    zone.vulnerability;

  const score =
    (
      lst * 0.25 +
      vegetation * 0.20 +
      population * 0.15 +
      builtup * 0.20 +
      vulnerability * 0.20
    );

  return Math.round(score);
}

function topZones() {

  return [...App.data.wards]
    .map(zone => ({
      ...zone,
      cacpi:
        calculateCACPI(
          zone
        )
    }))
    .sort(
      (a, b) =>
        b.cacpi -
        a.cacpi
    );
}

/******************************************************************
 DATA LOADER
******************************************************************/

async function loadCity(city) {

  const file =
    city === "Ahmedabad"
      ? "data/ahmedabad.json"
      : "data/rajkot.json";

  const response =
    await fetch(file);

  App.data =
    await response.json();

  App.city =
    city;

  App.activeZone =
    App.data.wards[0];

  populateZoneSelect();

  renderAll();
}

function populateCitySelect() {

  citySelect.innerHTML =
    `
      <option>
        Ahmedabad
      </option>

      <option>
        Rajkot
      </option>
    `;

  citySelect.value =
    App.city;

  citySelect.addEventListener(
    "change",
    async e => {

      await loadCity(
        e.target.value
      );

    }
  );
}

function populateZoneSelect() {

  zoneSelect.innerHTML =
    "";

  App.data.wards.forEach(
    ward => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        ward.id;

      option.textContent =
        ward.name;

      zoneSelect.appendChild(
        option
      );
    }
  );

  zoneSelect.value =
    App.activeZone.id;

  zoneSelect.onchange =
    e => {

      App.activeZone =
        App.data.wards.find(
          ward =>
            ward.id ===
            e.target.value
        );

      renderAll();
    };
}

/******************************************************************
 METRIC CARDS
******************************************************************/

function metric(
  label,
  value,
  subtitle,
  color
) {

  return `
    <div class="metric-tile">

      <div>

        <span>
          ${label}
        </span>

        <strong
          class="${color}"
        >
          ${value}
        </strong>

        <small>
          ${subtitle}
        </small>

      </div>

    </div>
  `;
}

function renderMetrics() {

  const zone =
    App.activeZone;

  const cacpi =
    calculateCACPI(
      zone
    );

  selectedZoneLabel.textContent =
    zone.name;

  mapMetrics.innerHTML =
    `
      ${metric(
        "CACPI",
        cacpi,
        "Priority Index",
        "tone-red"
      )}

      ${metric(
        "LST",
        zone.lst + "°C",
        "Surface Temperature",
        "tone-orange"
      )}

      ${metric(
        "NDVI",
        zone.ndvi,
        "Vegetation Index",
        "tone-green"
      )}

      ${metric(
        "Population",
        numberFormat(
          zone.population_density
        ),
        "per sq.km",
        "tone-blue"
      )}

      ${metric(
        "Built-Up",
        zone.builtup + "%",
        "Urban Density",
        "tone-purple"
      )}

      ${metric(
        "Vulnerability",
        zone.vulnerability,
        "Heat Exposure",
        "tone-cyan"
      )}
    `;

  mapInsight.textContent =
    `${zone.name} is currently prioritised with a CACPI score of ${cacpi}. Heat stress is primarily influenced by elevated surface temperatures, vegetation deficit, and high population exposure.`;
}
/******************************************************************
 VYOM-COOL AI
 Final Build
 Part 2/3
 SVG Map Engine
 Layer Engine
 Scenario Simulator
******************************************************************/

/******************************************************************
 SVG MAP ENGINE
******************************************************************/

function wardPolygon(
  ward,
  index
) {

  const size = 95;

  const x = ward.x;
  const y = ward.y;

  const offset =
    index % 2 === 0
      ? 18
      : -18;

  return `
    ${x},${y}
    ${x + size},${y + offset}
    ${x + size - 15},${y + size}
    ${x - 10},${y + size - 8}
  `;
}

function drawBaseMap(
  svg
) {

  svg.innerHTML = "";

  let roads = "";

  for (
    let i = 100;
    i <= 900;
    i += 120
  ) {

    roads += `
      <line
        x1="${i}"
        y1="60"
        x2="${i}"
        y2="560"
        class="road-line"
      />
    `;
  }

  for (
    let i = 80;
    i <= 560;
    i += 100
  ) {

    roads += `
      <line
        x1="60"
        y1="${i}"
        x2="920"
        y2="${i}"
        class="road-line"
      />
    `;
  }

  svg.insertAdjacentHTML(
    "beforeend",
    roads
  );

  svg.insertAdjacentHTML(
    "beforeend",
    `
    <path
      class="river"
      d="
      M50 100
      C200 180,
      320 250,
      500 220
      S760 180,
      900 310
      "
      fill="none"
      stroke="#5cbef5"
      stroke-width="12"
      stroke-linecap="round"
    />
    `
  );
}

function renderMap(
  svg
) {

  drawBaseMap(
    svg
  );

  App.data.wards.forEach(
    (
      ward,
      index
    ) => {

      const polygon =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon"
        );

      polygon.setAttribute(
        "points",
        wardPolygon(
          ward,
          index
        )
      );

      polygon.setAttribute(
        "fill",
        riskColor(
          ward.risk
        )
      );

      polygon.setAttribute(
        "stroke",
        "#ffffff"
      );

      polygon.setAttribute(
        "stroke-width",
        "2"
      );

      polygon.classList.add(
        "ward-cell"
      );

      if (
        App.activeZone &&
        ward.id ===
          App.activeZone.id
      ) {

        polygon.setAttribute(
          "stroke-width",
          "5"
        );

        polygon.setAttribute(
          "stroke",
          "#071a3d"
        );
      }

      polygon.addEventListener(
        "click",
        () => {

          App.activeZone =
            ward;

          zoneSelect.value =
            ward.id;

          renderAll();
        }
      );

      svg.appendChild(
        polygon
      );

      const text =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );

      text.setAttribute(
        "x",
        ward.x + 20
      );

      text.setAttribute(
        "y",
        ward.y + 50
      );

      text.setAttribute(
        "fill",
        "#ffffff"
      );

      text.setAttribute(
        "font-size",
        "12"
      );

      text.setAttribute(
        "font-weight",
        "700"
      );

      text.textContent =
        ward.name;

      svg.appendChild(
        text
      );
    }
  );
}

/******************************************************************
 LAYER ENGINE
******************************************************************/

function applyLayer(
  layer
) {

  const wards =
    document.querySelectorAll(
      ".ward-cell"
    );

  wards.forEach(
    (
      element,
      index
    ) => {

      const ward =
        App.data.wards[
          index %
          App.data.wards.length
        ];

      switch (
        layer
      ) {

        case "ndvi":

          element.setAttribute(
            "fill",
            `rgb(
              20,
              ${
                100 +
                ward.ndvi * 350
              },
              50
            )`
          );

          break;

        case "population":

          element.setAttribute(
            "fill",
            `rgb(
              ${
                40 +
                ward.population_density /
                100
              },
              50,
              210
            )`
          );

          break;

        case "interventions":

          element.setAttribute(
            "fill",
            "#18a9bf"
          );

          break;

        default:

          element.setAttribute(
            "fill",
            riskColor(
              ward.risk
            )
          );
      }
    }
  );
}

function initializeLayers() {

  $$(".layer-toggle")
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            $$(".layer-toggle")
              .forEach(
                b =>
                  b.classList.remove(
                    "active"
                  )
              );

            button.classList.add(
              "active"
            );

            App.activeLayer =
              button.dataset.layer;

            applyLayer(
              App.activeLayer
            );
          }
        );
      }
    );
}

/******************************************************************
 SCENARIO CONTROLS
******************************************************************/

function renderStrategies() {

  strategyControls.innerHTML =
    "";

  Strategies.forEach(
    strategy => {

      strategyControls.insertAdjacentHTML(
        "beforeend",
        `
        <div class="strategy-row">

          <div class="strategy-icon">
            ${strategy.emoji}
          </div>

          <div>

            <div class="strategy-head">

              <div>

                <strong>
                  ${strategy.name}
                </strong>

                <small>
                  Max Cooling:
                  ${strategy.cooling}°C
                </small>

              </div>

              <input
                type="checkbox"
                checked
                data-check="${strategy.id}"
              >

            </div>

            <div class="slider-wrap">

              <input
                type="range"
                min="0"
                max="100"
                value="${
                  App.simulation[
                    strategy.id
                  ]
                }"
                data-slider="${strategy.id}"
              >

              <span
                id="label-${strategy.id}"
              >
                ${
                  App.simulation[
                    strategy.id
                  ]
                }%
              </span>

            </div>

          </div>

        </div>
        `
      );
    }
  );

  bindScenarioEvents();
}

function bindScenarioEvents() {

  $$("[data-slider]")
    .forEach(
      slider => {

        slider.addEventListener(
          "input",
          () => {

            const id =
              slider.dataset.slider;

            App.simulation[
              id
            ] =
              Number(
                slider.value
              );

            const label =
              document.getElementById(
                `label-${id}`
              );

            if (
              label
            ) {

              label.textContent =
                slider.value +
                "%";
            }

            runSimulation();
          }
        );
      }
    );

  $$("[data-check]")
    .forEach(
      checkbox => {

        checkbox.addEventListener(
          "change",
          runSimulation
        );
      }
    );
}

/******************************************************************
 SIMULATION ENGINE
******************************************************************/

function runSimulation() {

  if (
    !App.activeZone
  ) return;

  const zone =
    App.activeZone;

  let totalCooling = 0;

  const selected =
    [];

  Strategies.forEach(
    strategy => {

      const enabled =
        document.querySelector(
          `[data-check="${strategy.id}"]`
        );

      if (
        enabled &&
        !enabled.checked
      ) {
        return;
      }

      const pct =
        App.simulation[
          strategy.id
        ];

      const cooling =
        (
          strategy.cooling *
          pct
        ) / 100;

      totalCooling +=
        cooling;

      selected.push({
        name:
          strategy.name,
        cooling
      });
    }
  );

  renderScenarioStats(
    zone,
    totalCooling
  );

  renderScenarioTable(
    selected
  );

  scenarioInsight.textContent =
    `
    AI simulation predicts a total cooling impact of
    ${totalCooling.toFixed(1)}°C
    for ${zone.name}.
    This reduces heat exposure and improves resilience
    for vulnerable populations.
    `;
}

function renderScenarioStats(
  zone,
  cooling
) {

  scenarioQuickStats.innerHTML =
    `
    <div class="quick-stat">
      <div>
        <span>Current LST</span>
        <strong>
          ${zone.lst}°C
        </strong>
      </div>
    </div>

    <div class="quick-stat">
      <div>
        <span>Cooling Gain</span>
        <strong>
          ${cooling.toFixed(1)}°C
        </strong>
      </div>
    </div>

    <div class="quick-stat">
      <div>
        <span>Projected LST</span>
        <strong>
          ${(
            zone.lst -
            cooling
          ).toFixed(1)}°C
        </strong>
      </div>
    </div>
    `;
}

function renderScenarioTable(
  rows
) {

  scenarioTable.innerHTML =
    "";

  rows.forEach(
    row => {

      const width =
        Math.min(
          row.cooling *
            20,
          100
        );

      scenarioTable.insertAdjacentHTML(
        "beforeend",
        `
        <div class="result-row">

          <div class="result-name">
            ${row.name}
          </div>

          <div class="bar-track">

            <div
              class="bar-fill"
              style="
              width:${width}%;
              background:#0b73d9;
              "
            ></div>

          </div>

          <strong>
            ${row.cooling.toFixed(
              2
            )}°C
          </strong>

        </div>
        `
      );
    }
  );
}
/******************************************************************
 VYOM-COOL AI
 Final Build
 Part 3/3
 Portfolio Optimizer
 AI Decision Copilot
 Tabs
 Startup
******************************************************************/

/******************************************************************
 PORTFOLIO ENGINE
******************************************************************/

function scoreStrategy(strategy) {

  const budget =
    Number(budgetRange.value);

  const water =
    waterSelect?.value || "medium";

  const land =
    landSelect?.value || "medium";

  const priority =
    prioritySelect?.value || "balanced";

  let score = 50;

  score += strategy.cooling * 12;

  score +=
    (1 - strategy.cost) * 25;

  if (water === "low") {
    score -=
      strategy.water * 20;
  }

  if (land === "low") {
    score -=
      strategy.land * 15;
  }

  if (priority === "critical") {
    score +=
      strategy.cooling * 8;
  }

  if (budget >= 20) {
    score += 10;
  }

  return Math.round(score);
}

function optimizePortfolio() {

  if (!App.activeZone) return;

  const ranking =
    Strategies.map(strategy => ({
      ...strategy,
      score:
        scoreStrategy(strategy)
    }))
    .sort(
      (a, b) =>
        b.score - a.score
    );

  renderPortfolioTable(
    ranking
  );

  renderPortfolioImpact(
    ranking
  );

  renderRoadmap(
    ranking
  );

  portfolioInsight.textContent =
    `
    Portfolio optimisation recommends
    ${ranking[0].name}
    as the highest-impact intervention
    for ${App.activeZone.name},
    followed by
    ${ranking[1].name}
    and
    ${ranking[2].name}.
    `;
}

function renderPortfolioTable(
  ranking
) {

  portfolioTable.innerHTML = `
    <table class="portfolio-grid">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Intervention</th>
          <th>Cooling</th>
          <th>Score</th>
        </tr>
      </thead>

      <tbody>

      ${ranking.map(
        (item, index) => `
        <tr>
          <td>#${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.cooling}°C</td>
          <td>${item.score}</td>
        </tr>
      `
      ).join("")}

      </tbody>
    </table>
  `;
}

function renderPortfolioImpact(
  ranking
) {

  const zone =
    App.activeZone;

  const top =
    ranking[0];

  portfolioImpact.innerHTML = `
    <h3>
      Recommended Portfolio
    </h3>

    <strong>
      ${top.name}
    </strong>

    <p>
      Highest projected cooling
      return under current constraints.
    </p>

    <ul>
      <li>
        CACPI:
        ${calculateCACPI(zone)}
      </li>

      <li>
        Risk:
        ${zone.risk}
      </li>

      <li>
        Cooling:
        ${top.cooling}°C
      </li>

      <li>
        Portfolio Score:
        ${top.score}
      </li>
    </ul>
  `;
}

function renderRoadmap(
  ranking
) {

  roadmapSteps.innerHTML = "";

  ranking
    .slice(0, 4)
    .forEach(
      (item, index) => {

        roadmapSteps.insertAdjacentHTML(
          "beforeend",
          `
          <div class="roadmap-step">

            <span>
              ${index + 1}
            </span>

            <div>

              <strong>
                ${item.name}
              </strong>

              <p>
                Priority deployment phase.
              </p>

            </div>

          </div>
          `
        );
      }
    );
}

/******************************************************************
 AI DECISION COPILOT
******************************************************************/

function addChatMessage(
  role,
  text
) {

  const block =
    document.createElement("div");

  block.className =
    `chat-message ${role}`;

  block.innerHTML = `
    <strong>
      ${role === "user"
        ? "You"
        : "AI Decision Copilot"}
    </strong>

    <p>${text}</p>
  `;

  chatLog.appendChild(
    block
  );

  chatLog.scrollTop =
    chatLog.scrollHeight;
}

function buildContext() {

  const zone =
    App.activeZone;

  const top =
    topZones()
      .slice(0, 3)
      .map(
        z =>
          `${z.name} (${z.cacpi})`
      )
      .join(", ");

  return `
City:
${App.city}

Selected Zone:
${zone.name}

CACPI:
${calculateCACPI(zone)}

LST:
${zone.lst}

NDVI:
${zone.ndvi}

Population Density:
${zone.population_density}

Risk:
${zone.risk}

Top Priority Zones:
${top}

You are VYOM-COOL AI,
an Urban Heat Decision Intelligence Platform.
Give concise decision-support recommendations.
`;
}

async function askGemini(
  prompt
) {

  if (
    !App.gemini.enabled ||
    !App.gemini.apiKey
  ) {

    return `
DEMO MODE

Priority Zone:
${App.activeZone.name}

Recommended Actions:
• Urban Greening
• Cool Roofs
• Blue-Green Infrastructure

Expected Cooling:
2°C to 5°C

This response is generated locally.
`;
  }

  try {

    const response =
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${App.gemini.model}:generateContent?key=${App.gemini.apiKey}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text:
                        buildContext() +
                        "\n\n" +
                        prompt
                    }
                  ]
                }
              ]
            })
        }
      );

    const json =
      await response.json();

    return (
      json?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text ||
      "No response generated."
    );

  } catch (err) {

    return `
Gemini API unavailable.

Please verify:
• API Key
• Network
• Gemini model
`;
  }
}

function initializeAI() {

  if (saveApiKey) {

    saveApiKey.onclick =
      () => {

        const key =
          apiKeyInput.value.trim();

        if (!key) {
          alert(
            "Enter Gemini API Key"
          );
          return;
        }

        App.gemini.apiKey =
          key;

        App.gemini.enabled =
          true;

        const model =
          document.getElementById(
            "modelSelect"
          );

        if (model) {
          App.gemini.model =
            model.value;
        }

        if (apiState) {

          apiState.innerHTML = `
            <span>
              Gemini
            </span>

            <strong>
              Connected
            </strong>
          `;
        }
      };
  }

  if (chatForm) {

    chatForm.addEventListener(
      "submit",
      async e => {

        e.preventDefault();

        const prompt =
          promptInput.value.trim();

        if (!prompt)
          return;

        addChatMessage(
          "user",
          prompt
        );

        promptInput.value =
          "";

        const answer =
          await askGemini(
            prompt
          );

        addChatMessage(
          "assistant",
          answer
        );
      }
    );
  }
}

/******************************************************************
 TABS
******************************************************************/

function initializeTabs() {

  const buttons =
    document.querySelectorAll(
      ".tab-button"
    );

  const panels =
    document.querySelectorAll(
      ".panel"
    );

  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          buttons.forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );

          panels.forEach(
            p =>
              p.classList.remove(
                "active"
              )
          );

          button.classList.add(
            "active"
          );

          const target =
            button.dataset.panel;

          const panel =
            document.querySelector(
              `.panel[data-panel="${target}"]`
            );

          if (panel) {
            panel.classList.add(
              "active"
            );
          }
        }
      );
    });
}

/******************************************************************
 GLOBAL RENDER
******************************************************************/

function renderAll() {

  if (
    !App.data ||
    !App.activeZone
  ) return;

  renderMetrics();

  if (cityMap)
    renderMap(cityMap);

  if (scenarioMap)
    renderMap(
      scenarioMap
    );

  applyLayer(
    App.activeLayer
  );

  runSimulation();

  optimizePortfolio();
}

/******************************************************************
 STARTUP
******************************************************************/

async function initializeApp() {

  populateCitySelect();

  initializeTabs();

  initializeLayers();

  initializeAI();

  renderStrategies();

  if (budgetRange) {

    budgetOutput.textContent =
      budgetRange.value;

    budgetRange.addEventListener(
      "input",
      () => {

        budgetOutput.textContent =
          budgetRange.value;

        optimizePortfolio();
      }
    );
  }

  waterSelect?.addEventListener(
    "change",
    optimizePortfolio
  );

  landSelect?.addEventListener(
    "change",
    optimizePortfolio
  );

  prioritySelect?.addEventListener(
    "change",
    optimizePortfolio
  );

  const runButton =
    document.getElementById(
      "runSimulation"
    );

  if (runButton) {
    runButton.addEventListener(
      "click",
      runSimulation
    );
  }

  await loadCity(
    "Ahmedabad"
  );

  addChatMessage(
    "assistant",
    `
Welcome to VYOM-COOL AI.

Try asking:

• Why is this ward prioritised?
• Which cooling strategy should be deployed?
• Generate a municipal action plan.
• Explain CACPI ranking.
`
  );
}

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);