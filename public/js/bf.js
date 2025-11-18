function calcular(weight, bf, weeks, age, height, sex) {
    weight = parseFloat(weight);
    bf = parseFloat(bf);
    weeks = parseInt(weeks);
    age = parseInt(age);
    height = parseInt(height);

    const bfFraction = bf / 100;
    const fatMass = weight * bfFraction;

    // Máximo déficit basado en masa grasa (sin limitarlo)
    const kcalPerKgFat = 69;
    const maximumDeficit = Math.round(fatMass * kcalPerKgFat);

    // Pérdida estimada diaria y semanal
    const dailyFatLoss = Math.round((maximumDeficit / 7700) * 1000);
    const perWeek = dailyFatLoss * 7 / 1000;

    // BMR (según sexo)
    const BMR = Math.round(
        (10 * weight) + (6.25 * height) - (5 * age) + (sex === "male" ? 5 : -161)
    );
    const TDEE = Math.round(BMR * 1.2);
    const rawCaloriesToConsume = TDEE - maximumDeficit;
    const caloriesToConsume = Math.max(rawCaloriesToConsume, 0);

    // Color de advertencia si excede 1100 kcal/día
    const color = (maximumDeficit > 1100 || rawCaloriesToConsume <= 0) ? "red" : "inherit";

    document.getElementById("1").innerHTML = `
        <tr>
            <td>Weight</td><td>Bodyfat %</td><td>Max Deficit</td>
            <td>BMR</td><td>TDEE</td><td>Calories to Consume</td>
        </tr>
        <tr style="color:${color}">
            <td>${weight.toFixed(2)}</td>
            <td>${bf.toFixed(2)}%</td>
            <td>${maximumDeficit}</td>
            <td>${BMR}</td>
            <td>${TDEE}</td>
            <td>${caloriesToConsume}</td>
        </tr>
    `;

    document.getElementById("4").innerHTML = `
        <span style="color:${color}">
        With a caloric deficit of ${maximumDeficit} calories/day, 
        you could expect to lose about ${dailyFatLoss} g/day or ${perWeek.toFixed(2)} kg/week.
        ${rawCaloriesToConsume <= 0 ? '<br/>Note: Calculated intake would be negative; intake shown as 0.' : ''}
        </span>
    `;

    weektable(weight, bf, maximumDeficit, weeks, dailyFatLoss, age, height, sex);
}

function weektable(weight, bf, deficit, weeks, dailyFatLoss, age, height, sex) {
    const fatLossRatio = 0.85;
    const leanLossRatio = 0.15;

    let currWeight = weight;
    let currBf = bf;
    let adaptationFactor = 1.0;

    const weeklyDiv = document.getElementById("weekly");
    weeklyDiv.style.display = "flex";
    weeklyDiv.style.flexDirection = "column";
    weeklyDiv.style.alignItems = "center";

    const initialBMR = Math.round(
        (10 * currWeight) + (6.25 * height) - (5 * age) + (sex === "male" ? 5 : -161)
    );
    const initialTDEE = Math.round(initialBMR * 1.2);

    weeklyDiv.innerHTML = `
        <p>Estimated weekly progression for ${weeks} weeks:</p>
        <label style="color:darkred">
        WARNING: Any deficit above 750cal could lead to muscle loss — 
        ensure adequate protein and recovery.
        </label>
        <table id="week-table">
            <tr>
                <td>Week</td><td>Weight (kg)</td><td>Body Fat (%)</td>
                <td>Deficit</td><td>BMR</td><td>TDEE</td><td>Calories</td>
            </tr>
            <tr>
                <td>0</td><td>${currWeight.toFixed(2)}</td><td>${currBf.toFixed(2)}</td>
                <td>${deficit}</td><td>${initialBMR}</td><td>${initialTDEE}</td>
                <td>${initialTDEE - deficit}</td>
            </tr>
        </table>
    `;

    const table = document.getElementById("week-table");

    for (let i = 1; i <= weeks; i++) {
        adaptationFactor *= 0.97;

        const bfFraction = currBf / 100;
        const fatMass = currWeight * bfFraction;

        const newDeficit = Math.round(fatMass * 69 * adaptationFactor);
        const weeklyWeightLoss = (dailyFatLoss * 7) / 1000;
        const fatKgLost = weeklyWeightLoss * fatLossRatio;
        const leanKgLost = weeklyWeightLoss * leanLossRatio;

        currWeight -= (fatKgLost + leanKgLost);
        const newFatMass = fatMass - fatKgLost;
        currBf = (newFatMass / currWeight) * 100;

        const BMR = Math.round(
            (10 * currWeight) + (6.25 * height) - (5 * age) + (sex === "male" ? 5 : -161)
        );
        const TDEE = Math.round(BMR * 1.2);
        const caloriesToConsume = Math.max(TDEE - newDeficit, 0);

        const row = document.createElement("tr");
        const color = (newDeficit > 1100 || (TDEE - newDeficit) <= 0) ? "red" : "inherit";

        row.innerHTML = `
            <td>${i}</td>
            <td>${currWeight.toFixed(2)}</td>
            <td>${currBf.toFixed(2)}</td>
            <td style="color:${color}">${newDeficit}</td>
            <td>${BMR}</td>
            <td>${TDEE}</td>
            <td>${caloriesToConsume}</td>
        `;
        table.appendChild(row);
    }

    document.getElementById("diet").style.display = "flex";
}

function showResultsModal() {
    const backdrop = document.getElementById("modal-backdrop");
    const modal = document.getElementById("results");
    if (backdrop) backdrop.style.display = "block";
    if (modal) modal.style.display = "flex";
}

function hideResultsModal() {
    const backdrop = document.getElementById("modal-backdrop");
    const modal = document.getElementById("results");
    if (backdrop) backdrop.style.display = "none";
    if (modal) modal.style.display = "none";
}

document.getElementById("calculate").addEventListener("click", function() {
    showResultsModal();
    calcular(
        document.getElementById("weight").value,
        document.getElementById("bf").value,
        document.getElementById("weeks").value,
        document.getElementById("age").value,
        document.getElementById("height").value,
        document.getElementById("sex").value
    );
});

const closeBtn = document.getElementById("close-results");
if (closeBtn) {
    closeBtn.addEventListener("click", hideResultsModal);
}

const backdropEl = document.getElementById("modal-backdrop");
if (backdropEl) {
    backdropEl.addEventListener("click", hideResultsModal);
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        hideResultsModal();
    }
});
