const placeFilter = document.getElementById("placeFilter");
const moodFilter = document.getElementById("moodFilter");
const audienceFilter = document.getElementById("audienceFilter");
const randomBtn = document.getElementById("randomBtn");

const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultSubtitle = document.getElementById("resultSubtitle");
const placeBadge = document.getElementById("placeBadge");
const moodBadge = document.getElementById("moodBadge");
const resultIcon = document.getElementById("resultIcon");
const choicePanel = document.getElementById("choicePanel");
const choiceBtn1 = document.getElementById("choiceBtn1");
const choiceBtn2 = document.getElementById("choiceBtn2");

let lastActivityName = null;

function getActivitiesList() {
  if (typeof activities === "undefined" || !Array.isArray(activities)) {
    return null;
  }

  return activities;
}

function getFilteredActivities() {
  const list = getActivitiesList();

  if (!list) {
    return null;
  }

  const selectedPlace = placeFilter.value;
  const selectedMood = moodFilter.value;
  const selectedAudience = audienceFilter.value;

  return list.filter((activity) => {
    const matchesPlace =
      selectedPlace === "all" || activity.place === selectedPlace;

    const matchesMood =
      selectedMood === "all" || activity.mood === selectedMood;

    const activityAudience = Array.isArray(activity.audience)
      ? activity.audience
      : ["both", "her", "him"];

    const matchesAudience =
      selectedAudience === "all" || activityAudience.includes(selectedAudience);

    return matchesPlace && matchesMood && matchesAudience;
  });
}

function getRandomActivity(list) {
  if (list.length === 0) {
    return null;
  }

  if (list.length === 1) {
    return list[0];
  }

  let randomActivity = null;

  do {
    const randomIndex = Math.floor(Math.random() * list.length);
    randomActivity = list[randomIndex];
  } while (randomActivity.name === lastActivityName);

  return randomActivity;
}

function getTwoRandomActivities(list) {
  if (!list || list.length === 0) {
    return [];
  }

  if (list.length === 1) {
    return [list[0]];
  }

  const firstActivity = getRandomActivity(list);

  const secondPool = list.filter(
    (activity) => activity.name !== firstActivity.name
  );

  const secondActivity = getRandomActivity(secondPool);

  return [firstActivity, secondActivity];
}

function getPlaceLabel(place) {
  if (place === "indoor") return "Indoor";
  if (place === "outdoor") return "Outdoor";
  return "Any place";
}

function getMoodLabel(mood) {
  if (mood === "active") return "Active";
  if (mood === "calm") return "Calm";
  return "Any mood";
}

function getActivityIcon(activity) {
  if (!activity) return "✨";

  if (activity.place === "outdoor" && activity.mood === "active") return "🚴";
  if (activity.place === "outdoor" && activity.mood === "calm") return "🌿";
  if (activity.place === "indoor" && activity.mood === "active") return "🏃";
  if (activity.place === "indoor" && activity.mood === "calm") return "📚";

  return "✨";
}

function getPlaceClass(place) {
  if (place === "indoor") return "choice-place-indoor";
  if (place === "outdoor") return "choice-place-outdoor";
  return "";
}

function getMoodClass(mood) {
  if (mood === "active") return "choice-mood-active";
  if (mood === "calm") return "choice-mood-calm";
  return "";
}

function renderChoiceButton(button, activity) {
  if (!button || !activity) {
    return;
  }

  button.className = `choice-btn ${activity.place} ${activity.mood}`;
  button.innerHTML = `
    <div class="choice-btn-top">
      <div class="choice-btn-icon">${getActivityIcon(activity)}</div>
      <div class="choice-btn-badges">
        <span class="choice-badge ${getPlaceClass(activity.place)}">${getPlaceLabel(activity.place)}</span>
        <span class="choice-badge ${getMoodClass(activity.mood)}">${getMoodLabel(activity.mood)}</span>
      </div>
    </div>
    <div class="choice-btn-title">${activity.name}</div>
  `;
}

function clearResultState() {
  result.classList.remove(
    "place-indoor",
    "place-outdoor",
    "mood-active",
    "mood-calm",
    "animating",
    "is-placeholder"
  );

  placeBadge.classList.remove("place-indoor", "place-outdoor");
  moodBadge.classList.remove("mood-active", "mood-calm");
}

function applyResultState(activity) {
  clearResultState();
  result.classList.remove("hidden");

  if (!activity) {
    result.classList.add("is-placeholder");
    resultTitle.textContent = "No activities found";
    resultSubtitle.textContent = "0 matching activities";
    placeBadge.textContent = getPlaceLabel(placeFilter.value);
    moodBadge.textContent = getMoodLabel(moodFilter.value);
    resultIcon.textContent = "🤔";
    return;
  }

  result.classList.add(`place-${activity.place}`);
  result.classList.add(`mood-${activity.mood}`);

  placeBadge.classList.add(`place-${activity.place}`);
  moodBadge.classList.add(`mood-${activity.mood}`);

  resultTitle.textContent = activity.name;
  const filteredCount = getFilteredActivities().length;
  resultSubtitle.textContent = `${filteredCount} matching activities`;
  placeBadge.textContent = getPlaceLabel(activity.place);
  moodBadge.textContent = getMoodLabel(activity.mood);
  resultIcon.textContent = getActivityIcon(activity);
}

function playResultAnimation() {
  result.classList.remove("animating");

  void result.offsetWidth;

  result.classList.add("animating");
}

randomBtn.addEventListener("click", () => {
  const filteredActivities = getFilteredActivities();

  if (!filteredActivities) {
    applyResultState(null);
    resultTitle.textContent = "Activities list is not loaded";
    resultSubtitle.textContent = "Check that activities.js is connected before script.js";
    resultIcon.textContent = "⚠️";

    if (choicePanel) {
      choicePanel.classList.add("hidden");
    }

    return;
  }

  const randomActivities = getTwoRandomActivities(filteredActivities);

  if (randomActivities.length === 0) {
    applyResultState(null);

    if (choicePanel) {
      choicePanel.classList.add("hidden");
    }

    return;
  }

  const hasChoiceUi = choicePanel && choiceBtn1 && choiceBtn2;

  if (!hasChoiceUi || randomActivities.length === 1) {
    const chosenActivity = randomActivities[0];

    if (chosenActivity) {
      lastActivityName = chosenActivity.name;
      applyResultState(chosenActivity);
      playResultAnimation();
    }

    if (choicePanel) {
      choicePanel.classList.add("hidden");
    }

    return;
  }

  const firstActivity = randomActivities[0];
  const secondActivity = randomActivities[1];

  result.classList.add("hidden");
  renderChoiceButton(choiceBtn1, firstActivity);
  renderChoiceButton(choiceBtn2, secondActivity);
  choicePanel.classList.remove("hidden");

  choiceBtn1.onclick = () => {
    lastActivityName = firstActivity.name;
    applyResultState(firstActivity);
    playResultAnimation();
  };

  choiceBtn2.onclick = () => {
    lastActivityName = secondActivity.name;
    applyResultState(secondActivity);
    playResultAnimation();
  };
});