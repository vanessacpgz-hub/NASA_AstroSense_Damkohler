// Base de datos de materiales para Módulo 1 (Fire Safety - SAFFIRE / BASS-II / SAME-R)
const MATERIALS_DB = {
    nomex: {
        name: 'Nomex / Kevlar Fabric',
        loi: 28.0,
        maxSafeSpread: 3.5,
        smokeFactor: 15.0,
        desc: 'Flame-resistant meta-aramid (PSI-26 BASS): high Limiting Oxygen Index (LOI ~28%) and self-extinguishing in normal air.'
    },
    cotton: {
        name: 'Cotton / Cellulose Blend',
        loi: 18.5,
        maxSafeSpread: 6.0,
        smokeFactor: 12.0,
        desc: 'Cellulosic crew apparel (PSI-98 SAFFIRE): ignites readily at 21% O₂; sustained downward/concurrent spread in cabin airflow.'
    },
    kapton: {
        name: 'Kapton / Polymer Insulation',
        loi: 37.0,
        maxSafeSpread: 2.0,
        smokeFactor: 8.0,
        desc: 'Avionics wire insulation (PSI-101 SAME): resists open flame, but electrical overheating generates dense ultrafine smoke aerosols.'
    }
};

let safetyChartInstance = null;

// Inicializar la gráfica de protocolos al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') {
        document.getElementById('safety-chart-fallback').hidden = false;
    } else {
        const ctx = document.getElementById('safetyChart').getContext('2d');
        safetyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['HVAC Filtration', 'Airflow Cutoff', 'CO₂ Portable', 'Cabin Venting'],
            datasets: [{
                label: 'Protocol Suitability (%)',
                data: [95, 40, 25, 10],
                backgroundColor: ['#71d5ae', '#62c9f5', '#818cf8', '#64748b'],
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
    changeMaterial();
});

// Cambiar material seleccionado
function changeMaterial() {
    const key = document.getElementById('material-select').value;
    const mat = MATERIALS_DB[key];
    document.getElementById('material-desc').textContent = mat.desc;
    document.getElementById('material-loi-badge').textContent = `LOI: ${mat.loi}%`;
    document.getElementById('limit-cabin-o2').textContent = `Material LOI: ${mat.loi}%`;
    document.getElementById('limit-spread').textContent = `Max Safe: ${mat.maxSafeSpread} mm/s`;
    document.getElementById('limit-smoke').textContent = `Alarm: > ${mat.smokeFactor} mg/m³`;
    updateSafetySim();
}

// Aplicar presets rápidos de seguridad
function applySafetyPreset(type) {
    if (type === 'nominal') {
        document.getElementById('slider-smoke').value = 1.2;
        document.getElementById('slider-spread').value = 0.0;
        document.getElementById('slider-flux').value = 1.1;
        document.getElementById('slider-cabin-o2').value = 21.0;
    } else if (type === 'smolder') {
        document.getElementById('slider-smoke').value = 22.0;
        document.getElementById('slider-spread').value = 1.5;
        document.getElementById('slider-flux').value = 2.8;
        document.getElementById('slider-cabin-o2').value = 21.5;
    } else if (type === 'fire') {
        document.getElementById('slider-smoke').value = 38.0;
        document.getElementById('slider-spread').value = 14.5;
        document.getElementById('slider-flux').value = 8.4;
        document.getElementById('slider-cabin-o2').value = 26.5;
    }
    updateSafetySim();
}

// Motor de simulación del Módulo 1
function updateSafetySim() {
    const key = document.getElementById('material-select').value;
    const mat = MATERIALS_DB[key];
    const smoke = parseFloat(document.getElementById('slider-smoke').value);
    const spread = parseFloat(document.getElementById('slider-spread').value);
    const flux = parseFloat(document.getElementById('slider-flux').value);
    const o2 = parseFloat(document.getElementById('slider-cabin-o2').value);

    document.getElementById('val-smoke').textContent = `${smoke.toFixed(1)} mg/m³`;
    document.getElementById('val-spread').textContent = `${spread.toFixed(1)} mm/s`;
    document.getElementById('val-flux').textContent = `${flux.toFixed(1)} kW/m²`;
    document.getElementById('val-cabin-o2').textContent = `${o2.toFixed(1)} %`;

    let logs = [];
    let status = 'NOMINAL';
    let integrity = 98;

    if (o2 >= mat.loi) {
        status = 'CRITICAL';
        integrity -= 40;
        logs.push({ type: 'danger', text: `[PSI-26/99] Cabin O₂ (${o2}%) exceeds ${mat.name} LOI (${mat.loi}%): Rapid self-sustained flame growth.` });
    } else {
        logs.push({ type: 'ok', text: `[PSI-26] Cabin O₂ (${o2}%) below ${mat.name} flammability threshold (LOI ${mat.loi}%).` });
    }

    if (spread > mat.maxSafeSpread) {
        status = 'CRITICAL';
        integrity -= 35;
        logs.push({ type: 'danger', text: `[PSI-25] Active flame propagation (${spread} mm/s > ${mat.maxSafeSpread} mm/s) detected along sample.` });
    } else if (spread > 0) {
        if (status !== 'CRITICAL') status = 'WARNING';
        integrity -= 15;
        logs.push({ type: 'warn', text: `[PSI-25] Slow creeping flame (${spread} mm/s) sustained by cabin ventilation airflow.` });
    }

    if (smoke > mat.smokeFactor) {
        if (status !== 'CRITICAL') status = 'WARNING';
        integrity -= 20;
        logs.push({ type: 'warn', text: `[PSI-101/102] Elevated smoke particulate concentration (${smoke} mg/m³): Optical obscuration risk.` });
    }

    if (flux > 2.5) {
        if (status !== 'CRITICAL') status = 'WARNING';
        integrity -= 15;
        logs.push({ type: 'warn', text: `[PSI-98/100] Radiative heat flux (${flux} kW/m²) exceeds nominal thermal limit (2.5 kW/m²).` });
    }

    integrity = Math.max(10, integrity);
    document.getElementById('safety-score').textContent = `Integrity: ${integrity}%`;

    const burnPct = Math.min(100, Math.round((spread / 25) * 100));
    document.getElementById('flame-front-bar').style.width = `${burnPct}%`;
    document.getElementById('burn-percent-label').textContent = `${burnPct}% PROPAGATION`;

    const badge = document.getElementById('safety-status-badge');
    const protoBadge = document.getElementById('protocol-badge');

    if (status === 'CRITICAL') {
        badge.textContent = 'CABIN STATUS: ACTIVE FIRE EMERGENCY';
        badge.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; background: rgba(237,69,72,0.15); color: #ffb4b5; border: 1px solid rgba(237,69,72,0.4);';
        protoBadge.textContent = 'Action: Airflow Cutoff + CO₂';
        updateSafetyChartData([15, 96, 92, 85], ['#64748b', '#ed4548', '#fbbf24', '#62c9f5']);
    } else if (status === 'WARNING') {
        badge.textContent = 'CABIN STATUS: SMOLDERING / SMOKE ALERT';
        badge.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3);';
        protoBadge.textContent = 'Action: Isolate Zone + Scrubbers';
        updateSafetyChartData([65, 94, 70, 30], ['#62c9f5', '#fbbf24', '#818cf8', '#64748b']);
    } else {
        badge.textContent = 'CABIN STATUS: NOMINAL';
        badge.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; background: rgba(84,214,160,0.15); color: #71d5ae; border: 1px solid rgba(84,214,160,0.3);';
        protoBadge.textContent = 'Action: Normal HVAC';
        updateSafetyChartData([96, 35, 20, 10], ['#71d5ae', '#62c9f5', '#818cf8', '#64748b']);
    }

    const logBox = document.getElementById('safety-log-container');
    logBox.innerHTML = logs.map(l => {
        let col = '#71d5ae', icon = '✓';
        if (l.type === 'warn') { col = '#fbbf24'; icon = '⚠'; }
        if (l.type === 'danger') { col = '#ff9a9c'; icon = '✖'; }
        return `<div style="color: ${col}; margin-bottom: 5px;">${icon} ${l.text}</div>`;
    }).join('');
}

function updateSafetyChartData(dataArr, colorsArr) {
    if (!safetyChartInstance) return;
    safetyChartInstance.data.datasets[0].data = dataArr;
    safetyChartInstance.data.datasets[0].backgroundColor = colorsArr;
    safetyChartInstance.update();
}

function resizeSafetyChart() {
    if (safetyChartInstance) safetyChartInstance.resize();
}