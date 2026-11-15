// Base de datos de combustibles basada en PSI-39, 117, 142 y 115
const FUELS_DB = {
    dodecane: {
        id: 'dodecane',
        name: 'n-Dodecane',
        formula: 'C₁₂H₂₆',
        isAlcohol: false,
        tempMinCF: 550,
        tempMaxCF: 850,
        pressMin: 0.25,
        pressMax: 5.0,
        critO2: 0.14,
        description: 'Standard heavy alkane (PSI-39 / PSI-117): strong NTC behavior and stable spherical cool flames in microgravity.'
    },
    heptane: {
        id: 'heptane',
        name: 'n-Heptane',
        formula: 'C₇H₁₆',
        isAlcohol: false,
        tempMinCF: 520,
        tempMaxCF: 800,
        pressMin: 0.50,
        pressMax: 3.0,
        critO2: 0.13,
        description: 'Medium-chain alkane (PSI-117 / PSI-142): classic multi-stage autoignition and oscillatory cool flames.'
    },
    methanol: {
        id: 'methanol',
        name: 'Methanol',
        formula: 'CH₃OH',
        isAlcohol: true,
        tempMinCF: 600,
        tempMaxCF: 900,
        pressMin: 1.00,
        pressMax: 2.0,
        critO2: 0.12,
        description: 'Simple alcohol (PSI-117 thesis baseline): soot-free combustion, high volatility, and minimal NTC cool flame chemistry.'
    }
};

let isMicrogravity = true;
let selectedFuelKey = 'dodecane';
let extinguisherChartInstance = null;

// Inicializar la gráfica al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') {
        document.getElementById('extinguisher-chart-fallback').hidden = false;
    } else {
        const ctx = document.getElementById('extinguisherChart').getContext('2d');
        extinguisherChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Xenon (Xe)', 'CO₂', 'Nitrogen (N₂)', 'Water Mist'],
                datasets: [{
                    label: 'Suppression Efficiency (%)',
                    data: [96, 82, 74, 48],
                    backgroundColor: ['#fbbf24', '#34d399', '#62c9f5', '#64748b'],
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, max: 100, ticks: { color: '#9aa9bf', font: { size: 10 } }, grid: { color: 'rgba(148,169,197,0.1)' } },
                    y: { ticks: { color: '#f4f7fc', font: { size: 11, weight: '600' } }, grid: { display: false } }
                }
            }
        });
    }

    changeFuel();
});

// Cambiar combustible activo
function changeFuel() {
    selectedFuelKey = document.getElementById('fuel-select').value;
    const fuel = FUELS_DB[selectedFuelKey];

    document.getElementById('fuel-description').textContent = fuel.description;
    document.getElementById('fuel-formula-badge').textContent = fuel.formula;

    document.getElementById('label-pressure-range').textContent = `Optimal: ${fuel.pressMin.toFixed(2)} - ${fuel.pressMax.toFixed(1)}`;
    document.getElementById('label-oxygen-crit').textContent = `<${Math.round(fuel.critO2 * 100)}% Extinction`;
    document.getElementById('label-temp-cf').textContent = `${fuel.isAlcohol ? 'Low T' : 'Cool'}: ${fuel.tempMinCF}-${fuel.tempMaxCF}K`;

    updateSimulation();
}

// Alternar Microgravedad / Gravedad Terrestre
function toggleGravity() {
    isMicrogravity = !isMicrogravity;
    const btn = document.getElementById('gravity-btn');
    const sphere = document.getElementById('flame-sphere');
    const particleLabel = document.getElementById('particle-threshold-label');

    if (isMicrogravity) {
        btn.innerText = "μg (Microgravity)";
        sphere.style.borderRadius = "50%";
        sphere.style.height = "56px";
        particleLabel.textContent = "Limit μg: 500";
    } else {
        btn.innerText = "1g (Terrestrial)";
        sphere.style.borderRadius = "50% 50% 40% 40%";
        sphere.style.height = "76px";
        particleLabel.textContent = "Limit 1g: 1000";
    }
    updateSimulation();
}

// Aplicar Presets Rápidos
function applyPreset(type) {
    const fuel = FUELS_DB[selectedFuelKey];
    const pSlider = document.getElementById('slider-pressure');
    const oSlider = document.getElementById('slider-oxygen');
    const tSlider = document.getElementById('slider-temp');
    const dSlider = document.getElementById('slider-dbp');

    if (type === 'nominal') {
        pSlider.value = ((fuel.pressMin + fuel.pressMax) / 2).toFixed(2);
        oSlider.value = 21.0;
        tSlider.value = fuel.tempMaxCF + 200;
        dSlider.value = fuel.isAlcohol ? 80 : 220;
    } else if (type === 'cool') {
        pSlider.value = Math.max(fuel.pressMin, 1.0).toFixed(2);
        oSlider.value = 21.0;
        tSlider.value = Math.round((fuel.tempMinCF + fuel.tempMaxCF) / 2);
        dSlider.value = fuel.isAlcohol ? 120 : 420;
    } else if (type === 'critical') {
        pSlider.value = Math.max(0.1, (fuel.pressMin - 0.15)).toFixed(2);
        oSlider.value = (fuel.critO2 * 100 - 2.5).toFixed(1);
        tSlider.value = fuel.tempMinCF - 70;
        dSlider.value = 780;
    }
    updateSimulation();
}

// Motor Principal de Simulación
function updateSimulation() {
    const fuel = FUELS_DB[selectedFuelKey];
    const pressure = parseFloat(document.getElementById('slider-pressure').value);
    const oxygenPct = parseFloat(document.getElementById('slider-oxygen').value);
    const oxygenFrac = oxygenPct / 100.0;
    const temp = parseInt(document.getElementById('slider-temp').value);
    const particles = parseInt(document.getElementById('slider-dbp').value);

    document.getElementById('val-pressure').innerText = pressure.toFixed(2) + " atm";
    document.getElementById('val-oxygen').innerText = oxygenPct.toFixed(1) + " %";
    document.getElementById('val-temp').innerText = temp + " K";
    document.getElementById('val-dbp').innerText = particles + " p/cm³";

    let status = 'GREEN';
    let alerts = [];
    let score = 96;

    const critO2Pct = Math.round(fuel.critO2 * 100);
    if (oxygenFrac < fuel.critO2) {
        status = 'RED';
        score -= 45;
        alerts.push({ type: 'danger', text: `[PSI-142] Critical oxygen for ${fuel.name} (${oxygenPct.toFixed(1)}% < ${critO2Pct}%): Imminent radiative extinction.` });
    } else if (oxygenFrac > 0.30) {
        status = 'RED';
        score -= 50;
        alerts.push({ type: 'danger', text: `[PSI-142] Hyperoxic atmosphere (${oxygenPct.toFixed(1)}% > 30%): Accelerated flame spread hazard in ${fuel.name}.` });
    }

    if (pressure < fuel.pressMin || pressure > fuel.pressMax) {
        if (status !== 'RED') status = 'YELLOW';
        score -= 18;
        alerts.push({ type: 'warn', text: `[PSI-39] Pressure out of range for ${fuel.name} (${pressure.toFixed(2)} atm; optimal ${fuel.pressMin}-${fuel.pressMax} atm).` });
    }

    let isCoolFlame = false;
    let isHotFlame = false;
    let isExtinct = false;

    if (oxygenFrac < fuel.critO2 || temp < fuel.tempMinCF) {
        isExtinct = true;
        if (temp < fuel.tempMinCF && status !== 'RED') {
            status = 'YELLOW';
            score -= 15;
            alerts.push({ type: 'warn', text: `[PSI-142] Insufficient temperature for ${fuel.name} (${temp}K < ${fuel.tempMinCF}K): No sustained ignition.` });
        }
    } else if (temp >= fuel.tempMinCF && temp <= fuel.tempMaxCF) {
        isCoolFlame = true;
        if (status !== 'RED') status = 'YELLOW';
        score -= 12;
        if (fuel.isAlcohol) {
            alerts.push({ type: 'warn', text: `[PSI-117] Slow oxidation zone in ${fuel.name} (${temp}K): Unlike n-alkanes, alcohols exhibit minimal NTC chemistry.` });
        } else {
            alerts.push({ type: 'warn', text: `[PSI-117] COOL FLAME regime detected in ${fuel.name} (${temp}K): Partial oxidation with low heat release.` });
        }
    } else {
        isHotFlame = true;
        alerts.push({ type: 'ok', text: `[PSI-39/117] Stable hot combustion of ${fuel.name} (${temp}K) within nominal limits.` });
    }

    const particleLimit = isMicrogravity ? 500 : 1000;
    if (particles > particleLimit) {
        if (status !== 'RED') status = 'YELLOW';
        score -= 15;
        const envText = isMicrogravity ? 'microgravity' : 'Earth gravity (1g)';
        alerts.push({ type: 'warn', text: `[PSI-115] High DBP particle nucleation (${particles} > ${particleLimit} p/cm³) in ${envText}.` });
    }

    score = Math.max(12, Math.min(100, score));
    document.getElementById('global-score').textContent = `Safety Score: ${score}/100`;

    // Actualizar insignia visual y geometría de llama
    const badge = document.getElementById('simulation-status-badge');
    const clusterDesc = document.getElementById('flame-cluster-desc');
    const sphere = document.getElementById('flame-sphere');

    let statusText = "NOMINAL";
    let badgeStyle = "background: rgba(84,214,160,0.15); color: #71d5ae; border: 1px solid rgba(84,214,160,0.3);";
    let clusterText = isMicrogravity ? "Cluster: Hot Flame (Spherical μg)" : "Cluster: Buoyant Flame (1g)";

    if (isExtinct || status === 'RED') {
        statusText = status === 'RED' ? `CRITICAL ALERT (${fuel.name.toUpperCase()})` : "EXTINCTION / NO FLAME";
        badgeStyle = "background: rgba(237,69,72,0.15); color: #ffb4b5; border: 1px solid rgba(237,69,72,0.4);";
        clusterText = "Cluster: Near Extinction / Unstable";
        sphere.style.background = "rgba(237,69,72,0.9)";
        sphere.style.boxShadow = "0 0 25px rgba(237,69,72,0.7)";
    } else if (isCoolFlame) {
        statusText = fuel.isAlcohol ? "LOW-TEMP OXIDATION" : "COOL FLAME DETECTED";
        badgeStyle = "background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3);";
        clusterText = isMicrogravity ? "Cluster: Cool Flame (Spherical μg)" : "Cluster: Buoyant Cool Flame (1g)";
        sphere.style.background = "rgba(98,201,245,0.9)";
        sphere.style.boxShadow = "0 0 25px rgba(98,201,245,0.7)";
    } else {
        sphere.style.background = "rgba(245,158,11,0.9)";
        sphere.style.boxShadow = "0 0 25px rgba(245,158,11,0.7)";
    }

    badge.innerText = `STATUS: ${statusText}`;
    badge.style.cssText = `margin-top: 12px; width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; ${badgeStyle}`;
    clusterDesc.innerText = clusterText;

    updateExtinguisherChart(isCoolFlame, isHotFlame, isExtinct, pressure, fuel);

    const logBox = document.getElementById('log-container');
    logBox.innerHTML = alerts.map(a => {
        let color = '#71d5ae';
        let prefix = '✓';
        if (a.type === 'warn') { color = '#fbbf24'; prefix = '⚠'; }
        if (a.type === 'danger') { color = '#ffb4b5'; prefix = '✖'; }
        return `<div style="color: ${color}; margin-bottom: 4px;"><span>${prefix}</span> ${a.text}</div>`;
    }).join('');
}

// Actualizar Gráfica de Extintores
function updateExtinguisherChart(isCoolFlame, isHotFlame, isExtinct, pressure, fuel) {
    let agents = [];
    let rationale = '';

    if (isExtinct) {
        agents = [
            { name: 'N₂ Ventilation / Purge', eff: 95, color: '#62c9f5' },
            { name: 'Xenon (Inert Gas)', eff: 70, color: '#818cf8' },
            { name: 'Carbon Dioxide (CO₂)', eff: 55, color: '#94a3b8' },
            { name: 'Water Mist', eff: 30, color: '#475569' }
        ];
        rationale = `Flame extinguished or unignited in ${fuel.name}: controlled Nitrogen purge recommended.`;
    } else if (fuel.isAlcohol) {
        agents = [
            { name: 'Xenon (Xe - Methanol Study)', eff: 94, color: '#62c9f5' },
            { name: 'Fine Water Mist (Dilution)', eff: 89, color: '#34d399' },
            { name: 'Carbon Dioxide (CO₂)', eff: 76, color: '#818cf8' },
            { name: 'Nitrogen (N₂)', eff: 68, color: '#64748b' }
        ];
        rationale = `For Methanol (${fuel.formula}), Xenon and fine water mist are highly effective.`;
    } else if (isCoolFlame) {
        agents = [
            { name: 'Xenon (Xe - PSI-117 Data)', eff: 96, color: '#fbbf24' },
            { name: 'Carbon Dioxide (CO₂)', eff: 82, color: '#34d399' },
            { name: 'Nitrogen (N₂)', eff: 74, color: '#62c9f5' },
            { name: 'Water Mist', eff: 48, color: '#64748b' }
        ];
        rationale = `For ${fuel.name} Cool Flames in microgravity, Xenon (Xe) excels due to low thermal diffusivity.`;
    } else {
        const waterEff = pressure > 2.0 ? 88 : 78;
        agents = [
            { name: 'Fine Water Mist', eff: waterEff, color: '#34d399' },
            { name: 'Carbon Dioxide (CO₂)', eff: 84, color: '#62c9f5' },
            { name: 'Xenon (Xe)', eff: 79, color: '#818cf8' },
            { name: 'Nitrogen (N₂)', eff: 65, color: '#64748b' }
        ];
        rationale = `In a ${fuel.name} Hot Flame, fine water mist rapidly absorbs latent heat.`;
    }

    agents.sort((a, b) => b.eff - a.eff);
    document.getElementById('recommended-ext-badge').textContent = `Ideal: ${agents[0].name.split(' (')[0]}`;
    document.getElementById('extinguisher-rationale').textContent = rationale;

    if (extinguisherChartInstance) {
        extinguisherChartInstance.data.labels = agents.map(a => a.name);
        extinguisherChartInstance.data.datasets[0].data = agents.map(a => a.eff);
        extinguisherChartInstance.data.datasets[0].backgroundColor = agents.map(a => a.color);
        extinguisherChartInstance.update();
    }
}

function resizeSuppressionChart() {
    if (extinguisherChartInstance) extinguisherChartInstance.resize();
}