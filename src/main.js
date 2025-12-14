import hello from "./doc.js";

hello()

document.addEventListener("DOMContentLoaded", function () {
  const bedHourElement = document.getElementById("bedHour");
  const bedMinuteElement = document.getElementById("bedMinute");
  const bedAmPmElement = document.getElementById("bedAmPm");
  const wakeHourElement = document.getElementById("wakeHour");
  const wakeMinuteElement = document.getElementById("wakeMinute");
  const wakeAmPmElement = document.getElementById("wakeAmPm");
  const resultElement = document.getElementById("result");

  // Valeurs initiales
  let bedHour = 22;
  let bedMinute = 0;
  let wakeHour = 6;
  let wakeMinute = 0;

  // Mise à jour de l'affichage
  function updateDisplay() {
    // Mise à jour des heures et minutes
    bedHourElement.textContent = bedHour.toString().padStart(2, "0");
    bedMinuteElement.textContent = bedMinute.toString().padStart(2, "0");
    wakeHourElement.textContent = wakeHour.toString().padStart(2, "0");
    wakeMinuteElement.textContent = wakeMinute.toString().padStart(2, "0");

    // Mise à jour des indicateurs de midi/minuit
    updateNoonIndicator("bed");
    updateNoonIndicator("wake");
  }

  // Indicateur de midi / minuit
  function updateNoonIndicator(type) {
    const hour = type === "bed" ? bedHour : wakeHour;
    const ampm = document.getElementById(`${type}AmPm`).value;
    const indicator = document.getElementById(`${type}NoonIndicator`);

    if (hour === 12) {
      indicator.textContent = ampm === "AM" ? "minuit" : "midi";
    } else {
      indicator.textContent = "";
    }
  }

  // Increment hour
  document.getElementById("bedHourUp").addEventListener("click", () => {
    bedHour = (bedHour % 12) + 1;
    updateDisplay();
  });

  // Mise à jour de l'indicateur quand l'AM/PM change
  document.getElementById("bedAmPm").addEventListener("change", updateDisplay);

  document.getElementById("wakeAmPm").addEventListener("change", () => {
    updateDisplay();
  });

  // decremet hour
  document.getElementById("bedHourDown").addEventListener("click", () => {
    bedHour = bedHour === 1 ? 12 : bedHour - 1;
    updateDisplay();
  });

  document.getElementById("bedMinuteUp").addEventListener("click", () => {
    bedMinute = (bedMinute + 5) % 60;
    updateDisplay();
  });

  document.getElementById("bedMinuteDown").addEventListener("click", () => {
    bedMinute = bedMinute === 0 ? 55 : bedMinute - 5;
    updateDisplay();
  });

  // Gestion des événements pour les boutons d'heure de réveil
  document.getElementById("wakeHourUp").addEventListener("click", () => {
    wakeHour = (wakeHour % 12) + 1;
    updateDisplay();
  });

  document.getElementById("wakeHourDown").addEventListener("click", () => {
    wakeHour = wakeHour === 1 ? 12 : wakeHour - 1;
    updateDisplay();
  });

  document.getElementById("wakeMinuteUp").addEventListener("click", () => {
    wakeMinute = (wakeMinute + 5) % 60;
    updateDisplay();
  });

  document.getElementById("wakeMinuteDown").addEventListener("click", () => {
    wakeMinute = wakeMinute === 0 ? 55 : wakeMinute - 5;
    updateDisplay();
  });

  // Fonction pour calculer la durée du sommeil
  function calculateSleepDuration() {
    // Convertir les heures en format 24h
    let bed24 = bedHour;
    if (bedAmPmElement.value === "PM" && bedHour < 12) {
      bed24 += 12;
    } else if (bedAmPmElement.value === "AM" && bedHour === 12) {
      bed24 = 0;
    }

    let wake24 = wakeHour;
    if (wakeAmPmElement.value === "PM" && wakeHour < 12) {
      wake24 += 12;
    } else if (wakeAmPmElement.value === "AM" && wakeHour === 12) {
      wake24 = 0;
    }

    // Calculer la durée en minutes
    let bedTotalMinutes = bed24 * 60 + bedMinute;
    let wakeTotalMinutes = wake24 * 60 + wakeMinute;

    // Gestion du passage à minuit
    if (wakeTotalMinutes <= bedTotalMinutes) {
      wakeTotalMinutes += 24 * 60; // Ajouter 24 heures
    }

    const durationMinutes = wakeTotalMinutes - bedTotalMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    // Calculer le nombre de cycles de sommeil (1 cycle = 90 minutes)
    const cycles = (durationMinutes / 90).toFixed(1);

    console.log((durationMinutes / 90).toFixed(0));

    // Déterminer la recommandation
    let recommendation = "";
    if (durationMinutes <= 5 * 60) {
      recommendation =
        "Temps de sommeil très insuffisant. Essayez de dormir plus longtemps pour une meilleure santé.";
    } else if (durationMinutes <= 6 * 60) {
      recommendation =
        "Temps de sommeil insuffisant. Un adulte a besoin de 7 à 9 heures de sommeil par nuit.";
    } else if (durationMinutes <= 9 * 60) {
      recommendation = "Temps de sommeil idéal. Continuez ainsi !";
    } else {
      recommendation =
        "Temps de sommeil suffisant, même trop";
    }

    // Afficher les résultats
    document.getElementById("sleepDuration").textContent = `${hours}h${minutes
      .toString()
      .padStart(2, "0")}`;
    document.getElementById("sleepCycles").textContent = cycles;
    document.getElementById("recommendation").textContent = recommendation;

    // Afficher la section des résultats
    resultElement.style.display = "block";
  }

  // Événement pour le bouton de calcul
  document
    .getElementById("calculate")
    .addEventListener("click", calculateSleepDuration);

  // Mise à jour initiale de l'affichage
  updateDisplay();
});
