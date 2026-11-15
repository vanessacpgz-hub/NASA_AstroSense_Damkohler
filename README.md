# AstroSense_Damkohler
**Understanding Fire. Protecting the Future of Space Exploration.**

[![NASA Space Apps Challenge 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-blue?style=for-the-badge&logo=nasa)](https://www.spaceappschallenge.org/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://nasaprueba2.vercel.app/)

---

## Overview

**AstroSense** is an integrated scientific platform designed to organize, explore, and analyze NASA research on fire behavior, combustion, and fire safety in microgravity and space environments. 

In space, fire behaves fundamentally differently due to the absence of buoyancy-driven convection—flames can become spherical, smolder invisibly, and spread unpredictably. By combining structured scientific datasets, specialized AI research assistants, and interactive mathematical simulations, AstroSense transforms complex NASA experimental records into an accessible Mission Control workspace for students, researchers, and engineers.

---

## Key Features

* **🛰️ Mission Control Telemetry Dashboard:** Simulated real-time orbital and cabin environmental monitoring (Cabin Oxygen `% O₂`, Radiative Heat Flux `kW/m²`, and Cabin Pressure `kPa`) paired with a Flight Event Log.
* **📚 Structured NASA Research Modules:** Deep integration and visual breakdowns of landmark microgravity combustion experiments:
  * **BASS (Burning and Suppression of Solids):** Analysis of 121 solid-fuel combustion tests across materials like PMMA, SIBAL fabric, Nomex, and Ultem.
  * **BASS-II:** Detailed gas measurements ($O_2$, $CO_2$, $CO$), airflow settings, and investigator records.
  * **SAFFIRE & SAME:** Spacecraft fire safety, smoke characterization, and mitigation thresholds.
* **🤖 Flamy AI Research Network:** An AI-powered research coordinator managing specialized assistants with two distinct consultation modes:
  * **Database Mode:** Strictly grounded in the integrated NASA scientific research database to prevent hallucinations.
  * **Internet Mode:** Combines internal scientific datasets with broader external web sources.
* **📈 Interactive Scenario Simulator:** Explore how changing environmental variables (such as oxygen concentration and heat flux) influence fire-related scenarios using literature-based mathematical approximations.

---

##  Scientific Transparency & Limitations

AstroSense is built with strict scientific rigor and transparency:
* **Simulations:** The Scenario Explorer uses mathematical approximations derived from published NASA literature rather than live Computational Fluid Dynamics (CFD) or experimentally validated flight tests.
* **Telemetry:** Cabin sensors and flight event logs operate as virtual demonstration feeds modeled after standard spacecraft nominal thresholds.

---

##  Tech Stack

* **Frontend:** [Ej. HTML5, CSS3, JavaScript / React / Astro / Tailwind CSS]
* **Data Visualization:** [Ej. Chart.js / D3.js / Custom SVG]
* **AI Integration:** [Ej. Gemini API / OpenAI API / RAG Pipeline]
* **Deployment:** Vercel

---

## Getting Started

To run a local copy of AstroSense, follow these steps:

1. **Clone the repository**
   ```bash
   git clone [https://github.com/](https://github.com/)[tu-usuario]/[nombre-del-repo].git
   cd [nombre-del-repo]
