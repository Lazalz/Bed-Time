import hello from "./doc.js";

hello();

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

  // Fonction utilitaire pour formater les minutes en heures:minutes
  function formatTimeFromMinutes(totalMinutes) {
    // Gérer le cas où totalMinutes est négatif ou dépasse 24h
    totalMinutes = (totalMinutes + 24 * 60) % (24 * 60);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12; // Convertir 0 en 12 pour 12h format

    return {
      hours: displayHours,
      minutes: minutes,
      ampm: ampm,
      toString: function () {
        return `${this.hours}h${this.minutes.toString().padStart(2, "0")} ${
          this.ampm
        }`;
      },
    };
  }

  // Fonction pour calculer les suggestions d'optimisation
  function calculateOptimization(bedTimeMins, wakeTimeMins) {
    const CYCLE_DURATION = 90; // Durée d'un cycle de sommeil en minutes
    const duration = wakeTimeMins - bedTimeMins;
    const currentCycles = duration / CYCLE_DURATION;

    // Si le nombre de cycles est déjà un entier, pas besoin d'optimisation
    if (Number.isInteger(currentCycles)) {
      return null;
    }

    // Calculer le nombre de cycles entier le plus proche
    const roundedCycles = Math.round(currentCycles);

    // S'assurer qu'on a au moins un cycle
    const targetCycles = Math.max(1, roundedCycles);
    const targetDuration = targetCycles * CYCLE_DURATION;

    // Calculer les nouvelles heures optimisées
    const optimizedWakeTime = bedTimeMins + targetDuration;
    const optimizedBedTime = wakeTimeMins - targetDuration;

    return {
      optimizedWakeTime: formatTimeFromMinutes(optimizedWakeTime),
      optimizedBedTime: formatTimeFromMinutes(optimizedBedTime),
      cycles: targetCycles,
    };
  }

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

    // Recommandation
    let recommendation = "";
    if (durationMinutes < 6 * 60) {
      // Moins de 6 heures
      recommendation =
        "Temps de sommeil insuffisant. Essayez de dormir entre 7 et 9 heures pour une meilleure récupération.";
    } else if (durationMinutes < 7 * 60) {
      // Entre 6 et 7 heures
      recommendation =
        "Temps de sommeil légèrement insuffisant. Visez 7 à 9 heures pour une santé optimale.";
    } else if (durationMinutes <= 9 * 60) {
      // Entre 7 et 9 heures (idéal)
      recommendation =
        "Temps de sommeil idéal pour un adulte. Continuez ainsi !";
    } else if (durationMinutes <= 10 * 60) {
      // Entre 9 et 10 heures
      recommendation =
        "Temps de sommeil suffisant. Attention à ne pas trop dormir non plus.";
    } else {
      // Plus de 10 heures
      recommendation =
        "Temps de sommeil excessif. Une sieste dans la journée peut être plus bénéfique.";
    }

    // Afficher les résultats
    document.getElementById("sleepDuration").textContent = `${hours}h${minutes
      .toString()
      .padStart(2, "0")}`;
    document.getElementById("sleepCycles").textContent = cycles;
    document.getElementById("recommendation").textContent = recommendation;

    // Calculer et afficher les suggestions d'optimisation
    const optimization = calculateOptimization(
      bedTotalMinutes,
      wakeTotalMinutes
    );
    const optimizationElement = document.getElementById("optimization");
    const optimizationWakeTimeElement = document.getElementById(
      "optimizationWakeTime"
    );
    const optimizationBedTimeElement = document.getElementById(
      "optimizationBedTime"
    );

    if (optimization) {
      // Afficher les suggestions d'optimisation
      optimizationWakeTimeElement.innerHTML = `• <strong>Option 1</strong> :  Pour <strong>${optimization.cycles} cycles complets</strong>, réveillez-vous à <strong>${optimization.optimizedWakeTime}</strong> en gardant la même heure de coucher.`;

      // Vérifier si l'heure de coucher optimisée est valide (pas négative)
      const optimizedBedTimeMins = wakeTotalMinutes - optimization.cycles * 90;
      if (optimizedBedTimeMins >= 0) {
        optimizationBedTimeElement.innerHTML = `• <strong>Option 2</strong> : Pour <strong>${optimization.cycles} cycles complets</strong>, couchez-vous à <strong>${optimization.optimizedBedTime}</strong> pour vous réveiller à l'heure prévue.`;
      } else {
        // Si l'heure de coucher optimisée est négative, suggérer de se coucher plus tôt
        const adjustedBedTime = formatTimeFromMinutes(bedTotalMinutes - 30); // 30 minutes plus tôt
        optimizationBedTimeElement.innerHTML = `• Pour un meilleur sommeil, essayez de vous coucher vers <strong>${adjustedBedTime}</strong> pour compléter plus de cycles.`;
      }

      optimizationElement.style.display = "block";
    } else {
      // Cacher la section d'optimisation si non nécessaire
      optimizationElement.innerHTML = `Votre cycle de sommeil est parfait`;
    }

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
