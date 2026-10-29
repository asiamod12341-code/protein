const foodDatabase = [
    { name: "Chicken breast, cooked", protein: 31 },
    { name: "Chicken thigh, cooked", protein: 26 },
    { name: "Tuna, canned", protein: 25 },
    { name: "Salmon, cooked", protein: 25 },
    { name: "Shrimp, cooked", protein: 24 },
    { name: "Beef, cooked", protein: 26 },
    { name: "Egg", protein: 13 },
    { name: "Milk", protein: 3.4 },
    { name: "Greek yogurt", protein: 10 },
    { name: "Cheddar cheese", protein: 25 },
    { name: "Cottage cheese", protein: 11 },
    { name: "Lentils, cooked", protein: 9 },
    { name: "Chickpeas, cooked", protein: 8.9 },
    { name: "Black beans, cooked", protein: 8.9 },
    { name: "White rice, cooked", protein: 2.7 },
    { name: "Brown rice, cooked", protein: 2.6 },
    { name: "Pasta, cooked", protein: 5.8 },
    { name: "Oats, dry", protein: 13 },
    { name: "Whole wheat bread", protein: 13 },
    { name: "White bread", protein: 9 },
    { name: "Peanut butter", protein: 25 },
    { name: "Almonds", protein: 21 },
    { name: "Dates", protein: 2 },
    { name: "Potato, boiled", protein: 1.9 },
    { name: "Sweet potato, cooked", protein: 2 }
];

// Main data
let dailyGoal = Number(localStorage.getItem("dailyGoal")) || 0;
let selectedDate = getToday();
let dailyFoods = {};

try {
    dailyFoods = JSON.parse(
        localStorage.getItem("dailyFoods") || "{}"
    );

    if (
        !dailyFoods ||
        typeof dailyFoods !== "object" ||
        Array.isArray(dailyFoods)
    ) {
        dailyFoods = {};
    }
} catch {
    dailyFoods = {};
}

// Import foods saved by the older version
if (!localStorage.getItem("dailyFoods")) {
    try {
        const oldFoods = JSON.parse(
            localStorage.getItem("foods") || "[]"
        );

        if (Array.isArray(oldFoods) && oldFoods.length > 0) {
            dailyFoods[getToday()] = oldFoods.map(function (food, index) {
                return {
                    id: Date.now() + index,
                    name: food.name,
                    protein: Number(food.protein) || 0
                };
            });

            saveData();
        }
    } catch {
        dailyFoods = {};
    }
}

function getToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
}

function getFoods() {
    if (!Array.isArray(dailyFoods[selectedDate])) {
        dailyFoods[selectedDate] = [];
    }

    return dailyFoods[selectedDate];
}

function saveData() {
    localStorage.setItem("dailyGoal", String(dailyGoal));
    localStorage.setItem("dailyFoods", JSON.stringify(dailyFoods));
}

// Calculate daily protein goal
function calculateProtein() {
    const ageInput = document.getElementById("age").value;
    const weightInput = document.getElementById("weight").value;
    const heightInput = document.getElementById("height").value;

    const age = Number(ageInput);
    const weight = Number(weightInput);
    const height = Number(heightInput);
    const activity = document.getElementById("activity").value;

    if (
        ageInput === "" ||
        weightInput === "" ||
        heightInput === "" ||
        !Number.isFinite(age) ||
        !Number.isFinite(weight) ||
        !Number.isFinite(height) ||
        age <= 0 ||
        weight <= 0 ||
        height <= 0
    ) {
        alert("Please enter valid information in all fields.");
        return;
    }

    if (age < 18) {
        alert("This calculator is designed for adults.");
        return;
    }

    if (activity === "low") {
        dailyGoal = weight * 0.8;
    } else if (activity === "moderate") {
        dailyGoal = weight * 1.2;
    } else {
        dailyGoal = weight * 1.4;
    }

    saveData();

    document.getElementById("result").innerHTML =
        "Your estimated daily protein goal is " +
        dailyGoal.toFixed(1) +
        " grams. <button onclick='confirmGoal()'>OK</button>";

    document.getElementById("foodSection").style.display = "none";
}

function confirmGoal() {
    document.getElementById("foodSection").style.display = "block";
    document.getElementById("goal").textContent = dailyGoal.toFixed(1);

    renderFoods();
}

// Add food manually or from the search
function addFood() {
    const foodName = document.getElementById("foodName").value.trim();
    const proteinInput = document.getElementById("foodProtein").value;
    const foodProtein = Number(proteinInput);

    if (
        foodName === "" ||
        proteinInput === "" ||
        !Number.isFinite(foodProtein) ||
        foodProtein <= 0
    ) {
        alert("Please enter a food name and a valid protein amount.");
        return false;
    }

    getFoods().push({
        id: Date.now() + Math.random(),
        name: foodName,
        protein: foodProtein
    });

    saveData();
    renderFoods();

    document.getElementById("foodName").value = "";
    document.getElementById("foodProtein").value = "";

    return true;
}

// Delete food
function deleteFood(id) {
    dailyFoods[selectedDate] = getFoods().filter(function (food) {
        return food.id !== id;
    });

    saveData();
    renderFoods();
}

// Display food diary
function renderFoods() {
    const foodList = document.getElementById("foodList");
    foodList.innerHTML = "";

    getFoods().forEach(function (food) {
        const foodItem = document.createElement("li");
        const foodText = document.createElement("span");
        const deleteButton = document.createElement("button");

        foodText.textContent =
            food.name + " - " + food.protein.toFixed(1) + " g protein";

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.className = "delete-button";

        deleteButton.onclick = function () {
            deleteFood(food.id);
        };

        foodItem.appendChild(foodText);
        foodItem.appendChild(deleteButton);
        foodList.appendChild(foodItem);
    });

    updateProtein();
}

// Update totals and progress bar
function updateProtein() {
    const consumedProtein = getFoods().reduce(function (total, food) {
        return total + food.protein;
    }, 0);

    const remaining = dailyGoal - consumedProtein;

    document.getElementById("goal").textContent =
        dailyGoal.toFixed(1);

    document.getElementById("consumed").textContent =
        consumedProtein.toFixed(1);

    document.getElementById("remaining").textContent =
        Math.max(0, remaining).toFixed(1);

    if (remaining <= 0 && dailyGoal > 0) {
        document.getElementById("remaining").textContent =
            "0 (Daily goal reached!)";
    }

    const percentage = dailyGoal > 0
        ? Math.min(100, (consumedProtein / dailyGoal) * 100)
        : 0;

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        percentage.toFixed(0) + "% of your daily goal";
}

// Change diary date
function changeDate() {
    selectedDate = document.getElementById("selectedDate").value;

    if (!selectedDate) {
        selectedDate = getToday();
        document.getElementById("selectedDate").value = selectedDate;
    }

    renderFoods();
}

// Restore saved data
function restoreData() {
    const dateInput = document.getElementById("selectedDate");

    dateInput.value = selectedDate;
    dateInput.addEventListener("change", changeDate);

    if (dailyGoal > 0) {
        document.getElementById("goal").textContent =
            dailyGoal.toFixed(1);

        document.getElementById("foodSection").style.display = "block";

        document.getElementById("result").textContent =
            "Your saved daily protein goal is " +
            dailyGoal.toFixed(1) + " grams.";
    }

    renderFoods();
}

// Search for food and calculate protein by weight
function searchFoods() {
    const query = document
        .getElementById("foodSearch")
        .value
        .trim()
        .toLowerCase();

    const results = document.getElementById("searchResults");
    results.innerHTML = "";

    if (query === "") {
        return;
    }

    const matches = foodDatabase.filter(function (food) {
        return food.name.toLowerCase().includes(query);
    });

    if (matches.length === 0) {
        results.textContent = "No foods found. Try another name.";
        return;
    }

    matches.forEach(function (food) {
        const item = document.createElement("div");
        const description = document.createElement("p");
        const weightLabel = document.createElement("label");
        const weightInput = document.createElement("input");
        const proteinText = document.createElement("p");
        const button = document.createElement("button");

        description.textContent =
            food.name + " | " + food.protein +
            " g protein per 100 g";

        weightLabel.textContent = "Weight in grams:";

        weightInput.type = "number";
        weightInput.min = "1";
        weightInput.step = "1";
        weightInput.value = "100";
        weightInput.setAttribute("aria-label", "Weight in grams");

        proteinText.textContent =
            "Protein: " + food.protein.toFixed(1) + " g";

        weightInput.addEventListener("input", function () {
            const weight = Number(weightInput.value);

            if (
                weightInput.value.trim() === "" ||
                !Number.isFinite(weight) ||
                weight <= 0
            ) {
                proteinText.textContent = "Enter a valid weight.";
                return;
            }

            const protein = (food.protein * weight) / 100;

            proteinText.textContent =
                "Protein: " + protein.toFixed(1) + " g";
        });

        button.textContent = "Add food";
        button.type = "button";

        button.onclick = function () {
            const weight = Number(weightInput.value);

            if (
                weightInput.value.trim() === "" ||
                !Number.isFinite(weight) ||
                weight <= 0
            ) {
                alert("Please enter a valid weight in grams.");
                return;
            }

            const protein = (food.protein * weight) / 100;

            document.getElementById("foodName").value =
                food.name + " (" + weight + " g)";

            document.getElementById("foodProtein").value =
                protein.toFixed(1);

            const added = addFood();

            if (added) {
                document.getElementById("foodSearch").value = "";
                results.innerHTML = "";
            }
        };

        item.appendChild(description);
        item.appendChild(weightLabel);
        item.appendChild(weightInput);
        item.appendChild(proteinText);
        item.appendChild(button);

        results.appendChild(item);
    });
}

document
    .getElementById("foodSearch")
    .addEventListener("input", searchFoods);

restoreData();