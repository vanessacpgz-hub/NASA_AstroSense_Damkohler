const MODELS_CONFIG = {
    spice: {
        name: 'PSI-60: SPICE Image Processing & Soot Model',
        ref: 'PSI-60',
        desc: 'Extracts temperature distributions and soot volume fractions from SPICE video telemetry[cite: 5].',
        p1: { label: 'Soot Volume Fraction', unit: 'ppm', min: 0.1, max: 15.0, step: 0.1, val: 2.4, minStr: '0.1 ppm', midStr: 'Nominal: < 5.0', maxStr: '15.0 ppm' },
        p2: { label: 'Pyrometric Temp Index', unit: 'K', min: 300, max: 2000, step: 10, val: 1250, minStr: '300 K', midStr: 'Optimal: 1200K', maxStr: '2000 K' },
        p3: { label: 'Optical Density Field', unit: 'a.u.', min: 0.0, max: 5.0, step: 0.1, val: 1.2, minStr: '0.0', midStr: 'Clear: < 2.0', maxStr: '5.0' },
        p4: { label: 'Image Frame Rate', unit: 'fps', min: 10, max: 250, step: 5, val: 60, minStr: '10 fps', midStr: 'Standard: 60', maxStr: '250 fps' },
        chartLabel: 'SPICE Optical Soot Evolution'
    },
    fgm: {
        name: 'PSI-62: Concurrent Flame Spread (FGM Model)',
        ref: 'PSI-62',
        desc: 'Flame generated manifold (FGM) algorithms predicting concurrent spread rates across solid surfaces[cite: 5].',
        p1: { label: 'Surface Spread Rate', unit: 'mm/s', min: 0.0, max: 20.0, step: 0.5, val: 3.2, minStr: '0.0 mm/s', midStr: 'Safe: < 5.0', maxStr: '20.0 mm/s' },
        p2: { label: 'Ignition Probability', unit: '%', min: 0, max: 100, step: 1, val: 18.0, minStr: '0%', midStr: 'Safe: < 35%', maxStr: '100%' },
        p3: { label: 'Pyrolysis Heat Flux', unit: 'kW/m²', min: 0.5, max: 20.0, step: 0.5, val: 4.5, minStr: '0.5', midStr: 'Nominal: < 6.0', maxStr: '20.0 kW/m²' },
        p4: { label: 'Solid Density Factor', unit: 'g/cm³', min: 0.1, max: 3.0, step: 0.1, val: 1.4, minStr: '0.1', midStr: 'Standard: 1.4', maxStr: '3.0 g/cm³' },
        chartLabel: 'FGM Flame Spread Rate Curve'
    },
    cfd: {
        name: 'PSI-117: Thermo-Convective Cool Flame CFD',
        ref: 'PSI-117',
        desc: 'Multidimensional multi-physics CFD analysis on external thermo-convective perturbation effects[cite: 3, 5].',
        p1: { label: 'Convective Perturbation', unit: 'Hz', min: 0.0, max: 5.0, step: 0.1, val: 1.1, minStr: '0 Hz', midStr: 'Resonance: 2.0', maxStr: '5.0 Hz' },
        p2: { label: 'Oscillation Amplitude', unit: 'mm', min: 0.1, max: 10.0, step: 0.1, val: 2.5, minStr: '0.1 mm', midStr: 'Stable: < 4.0', maxStr: '10.0 mm' },
        p3: { label: 'Chamber Pressure Perturb', unit: 'atm', min: 0.1, max: 4.0, step: 0.05, val: 1.0, minStr: '0.1 atm', midStr: 'Nominal: 1.0', maxStr: '4.0 atm' },
        p4: { label: 'CFD 3D Mesh Nodes', unit: 'M nodes', min: 0.5, max: 10.0, step: 0.5, val: 3.0, minStr: '0.5M', midStr: 'High Res: 3.0', maxStr: '10.0M' },
        chartLabel: 'CFD Thermal Oscillation Spectrum'
    }
};

let predictiveChartInstance = null;

window.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') {
        document.getElementById('predictive-chart-fallback').hidden = false;
    } else {
        const ctx = document.getElementById('predictiveChart').getContext('2d');
        predictiveChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['T-4s', 'T-3s', 'T-2s', 'T-1s', 'Live'],
            datasets: [{
                label: 'Model vs Telemetry',
                data: [2.1, 2.3, 2.2, 2.5, 2.4],
                borderColor: '#62c9f5',
                backgroundColor: 'rgba(98, 201, 245, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { ticks: { color: '#9aa9bf', font: { size: 10 } }, grid: { color: 'rgba(148,169,197,0.1)' } },
                x: { ticks: { color: '#f4f7fc', font: { size: 10 } }, grid: { display: false } }
            }
        }
        });
    }
    changeModel();
});

function changeModel() {
    const key = document.getElementById('model-select').value;
    const cfg = MODELS_CONFIG[key];
    
    document.getElementById('model-desc').textContent = cfg.desc;
    document.getElementById('model-ref-badge').textContent = cfg.ref;
    document.getElementById('chart-title-text').textContent = `📈 ${cfg.chartLabel}`;

    ['p1', 'p2', 'p3', 'p4'].forEach((pId, idx) => {
        const pData = cfg[idx === 0 ? 'p1' : idx === 1 ? 'p2' : idx === 2 ? 'p3' : 'p4'];
        document.getElementById(`label-${pId}`).innerHTML = `${pData.label} <span style="color: var(--accent-cyan); font-size: 9px; display: block;">Ref: ${cfg.ref}</span>`;
        
        const slider = document.getElementById(`slider-${pId}`);
        slider.min = pData.min;
        slider.max = pData.max;
        slider.step = pData.step;
        slider.value = pData.val;

        document.getElementById(`${pId}-min`).textContent = pData.minStr;
        document.getElementById(`${pId}-mid`).textContent = pData.midStr;
        document.getElementById(`${pId}-max`).textContent = pData.maxStr;
    });

    updateModelSim();
}

function applyModelPreset(type) {
    const key = document.getElementById('model-select').value;
    const cfg = MODELS_CONFIG[key];
    const multipliers = type === 'stable' ? 0.6 : type === 'perturb' ? 1.2 : 1.8;
    
    document.getElementById('slider-p1').value = (cfg.p1.val * multipliers).toFixed(1);
    document.getElementById('slider-p2').value = (cfg.p2.val * multipliers).toFixed(1);
    document.getElementById('slider-p3').value = Math.min(cfg.p3.max, cfg.p3.val * multipliers).toFixed(1);
    document.getElementById('slider-p4').value = cfg.p4.val;

    updateModelSim();
}

function updateModelSim() {
    const key = document.getElementById('model-select').value;
    const cfg = MODELS_CONFIG[key];

    const v1 = parseFloat(document.getElementById('slider-p1').value);
    const v2 = parseFloat(document.getElementById('slider-p2').value);
    const v3 = parseFloat(document.getElementById('slider-p3').value);
    const v4 = parseFloat(document.getElementById('slider-p4').value);

    document.getElementById('val-p1').textContent = `${v1.toFixed(1)} ${cfg.p1.unit}`;
    document.getElementById('val-p2').textContent = `${v2.toFixed(1)} ${cfg.p2.unit}`;
    document.getElementById('val-p3').textContent = `${v3.toFixed(1)} ${cfg.p3.unit}`;
    document.getElementById('val-p4').textContent = `${v4.toFixed(1)} ${cfg.p4.unit}`;

    let logs = [];
    let status = 'STABLE';
    let accuracy = 96.4;

    if (v1 > (cfg.p1.max * 0.75) || v3 > (cfg.p3.max * 0.75)) {
        status = 'CRITICAL';
        accuracy -= 12;
        logs.push({ type: 'danger', text: `[${cfg.ref}] High parameter threshold breached (${v1} ${cfg.p1.unit}): Mathematical divergence detected.` });
    } else if (v2 > (cfg.p2.max * 0.5)) {
        status = 'WARNING';
        accuracy -= 6;
        logs.push({ type: 'warn', text: `[${cfg.ref}] Oscillatory sensitivity threshold reached in ${cfg.name}.` });
    } else {
        logs.push({ type: 'ok', text: `[${cfg.ref}] ${cfg.name}: Converged successfully within nominal safety envelope.` });
    }

    accuracy = Math.max(78, accuracy.toFixed(1));
    document.getElementById('model-accuracy-badge').textContent = `Accuracy: ${accuracy}%`;

    if (predictiveChartInstance) {
        const baseVal = v1;
        predictiveChartInstance.data.datasets[0].data = [
            (baseVal * 0.9).toFixed(1),
            (baseVal * 0.95).toFixed(1),
            (baseVal * 0.98).toFixed(1),
            (baseVal * 1.02).toFixed(1),
            baseVal.toFixed(1)
        ];
        predictiveChartInstance.update();
    }

    const badge = document.getElementById('model-status-badge');
    const core = document.getElementById('heatmap-core');

    if (status === 'CRITICAL') {
        badge.textContent = 'MODEL STATUS: INSTABILITY / DIVERGENCE';
        badge.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; background: rgba(237,69,72,0.15); color: #ffb4b5; border: 1px solid rgba(237,69,72,0.4);';
        core.style.background = '#f43f5e';
    } else if (status === 'WARNING') {
        badge.textContent = 'MODEL STATUS: PERTURBATION DETECTED';
        badge.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3);';
        core.style.background = '#fbbf24';
    } else {
        badge.textContent = 'MODEL STATUS: PREDICTION STABLE';
        badge.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; background: rgba(84,214,160,0.15); color: #71d5ae; border: 1px solid rgba(84,214,160,0.3);';
        core.style.background = '#fef08a';
    }

    const logBox = document.getElementById('model-log-container');
    logBox.innerHTML = logs.map(l => {
        let col = '#71d5ae', icon = '✓';
        if (l.type === 'warn') { col = '#fbbf24'; icon = '⚠'; }
        if (l.type === 'danger') { col = '#ffb4b5'; icon = '✖'; }
        return `<div style="color: ${col}; margin-bottom: 5px;">${icon} ${l.text}</div>`;
    }).join('');
}

function resizePredictiveChart() {
    if (predictiveChartInstance) predictiveChartInstance.resize();
}