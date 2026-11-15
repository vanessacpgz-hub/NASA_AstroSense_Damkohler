const DISSIPATION_CONFIG = {
    flex: {
        name: 'PSI-69: FLEX Droplet Quenching & Vaporization',
        ref: 'PSI-69',
        desc: 'Evaluates droplet extinction diameter and thermal absorption via Flame Extinguishment Experiment data.',
        p1: { label: 'Thermal Cooling Rate', unit: 'K/s', min: 1.0, max: 150.0, step: 1.0, val: 15.0, minStr: '1 K/s', midStr: 'Quench: > 60', maxStr: '150 K/s' },
        p2: { label: 'Droplet Diameter (d₀)', unit: 'mm', min: 0.1, max: 3.0, step: 0.05, val: 1.25, minStr: '0.1 mm', midStr: 'Critical: < 0.4', maxStr: '3.0 mm' },
        p3: { label: 'Chamber Pressure', unit: 'atm', min: 0.5, max: 5.0, step: 0.1, val: 1.0, minStr: '0.5 atm', midStr: 'Nominal: 1.0', maxStr: '5.0 atm' },
        p4: { label: 'Vaporization Rate', unit: 'mg/s', min: 0.1, max: 25.0, step: 0.2, val: 4.2, minStr: '0.1', midStr: 'Stable: < 8.0', maxStr: '25.0 mg/s' },
        chartLabel: 'FLEX Droplet Quenching Efficiency'
    },
    flex2: {
        name: 'PSI-68: FLEX-2 Pressure & Oxygen Dilution Limits',
        ref: 'PSI-68',
        desc: 'Analyzes oxygen mole fraction and diluent gas boundaries for complete flame suppression in FLEX-2.',
        p1: { label: 'Oxygen Mole Fraction', unit: '%', min: 10.0, max: 35.0, step: 0.5, val: 21.0, minStr: '10%', midStr: 'Limit: < 14%', maxStr: '35%' },
        p2: { label: 'CO₂ / N₂ Diluent Ratio', unit: '%', min: 0.0, max: 50.0, step: 0.5, val: 5.0, minStr: '0%', midStr: 'Extinct: > 28%', maxStr: '50%' },
        p3: { label: 'Chamber Ambient Temp', unit: 'K', min: 290, max: 800, step: 5, val: 300, minStr: '290 K', midStr: 'Nominal: 300K', maxStr: '800 K' },
        p4: { label: 'Suppressor Injection Rate', unit: 'L/min', min: 0.1, max: 15.0, step: 0.1, val: 2.0, minStr: '0.1 L/min', midStr: 'Active: > 6.0', maxStr: '15.0 L/min' },
        chartLabel: 'FLEX-2 Oxygen Dilution Suppression Curve'
    },
    cool: {
        name: 'PSI-142: Cool Flame Radiation & Stretch Extinction',
        ref: 'PSI-142',
        desc: 'Studies ozone-sensitized counterflow cool flame transitions, radiation losses, and stretch extinction limits.',
        p1: { label: 'Radiation Heat Loss', unit: 'kW/m²', min: 1.0, max: 50.0, step: 0.5, val: 8.5, minStr: '1 kW/m²', midStr: 'Stretch: > 25', maxStr: '50 kW/m²' },
        p2: { label: 'Scalar Dissipation Rate', unit: 's⁻¹', min: 5.0, max: 200.0, step: 2.0, val: 35.0, minStr: '5 s⁻¹', midStr: 'Extinct: > 120', maxStr: '200 s⁻¹' },
        p3: { label: 'Cool Flame Radical Index', unit: 'a.u.', min: 0.0, max: 10.0, step: 0.1, val: 3.4, minStr: '0.0', midStr: 'Transition: 5.0', maxStr: '10.0' },
        p4: { label: 'Counterflow Velocity Gradient', unit: 's⁻¹', min: 10, max: 500, step: 5, val: 75, minStr: '10 s⁻¹', midStr: 'Critical: 300', maxStr: '500 s⁻¹' },
        chartLabel: 'Cool Flame Stretch Extinction Spectrum'
    }
};

let dissipationChartInstance = null;

window.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') {
        document.getElementById('dissipation-chart-fallback').hidden = false;
    } else {
        const ctx = document.getElementById('dissipationChart').getContext('2d');
        dissipationChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cooling / O₂', 'Droplet / Diluent', 'Pressure / Temp', 'Vapor / Stretch'],
            datasets: [{
                label: 'Extinction Metric (%)',
                data: [45, 60, 50, 40],
                backgroundColor: ['#62c9f5', '#71d5ae', '#818cf8', '#64748b'],
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
    changeSuppressor();
});

function changeSuppressor() {
    const key = document.getElementById('suppressor-select').value;
    const cfg = DISSIPATION_CONFIG[key];

    document.getElementById('suppressor-desc').textContent = cfg.desc;
    document.getElementById('suppressor-ref-badge').textContent = cfg.ref;
    document.getElementById('d-chart-title-text').textContent = `📊 ${cfg.chartLabel}`;

    ['p1', 'p2', 'p3', 'p4'].forEach((pId, idx) => {
        const pData = cfg[idx === 0 ? 'p1' : idx === 1 ? 'p2' : idx === 2 ? 'p3' : 'p4'];
        document.getElementById(`d-label-${pId}`).innerHTML = `${pData.label} <span style="color: var(--accent-cyan); font-size: 9px; display: block;">Ref: ${cfg.ref}</span>`;
        
        const slider = document.getElementById(`d-slider-${pId}`);
        slider.min = pData.min;
        slider.max = pData.max;
        slider.step = pData.step;
        slider.value = pData.val;

        document.getElementById(`d-${pId}-min`).textContent = pData.minStr;
        document.getElementById(`d-${pId}-mid`).textContent = pData.midStr;
        document.getElementById(`d-${pId}-max`).textContent = pData.maxStr;
    });

    updateDissipationSim();
}

function applyDissipationPreset(type) {
    const key = document.getElementById('suppressor-select').value;
    const cfg = DISSIPATION_CONFIG[key];

    if (key === 'flex') {
        document.getElementById('d-slider-p1').value = type === 'extinct' ? 120 : type === 'quenching' ? 70 : 15;
        document.getElementById('d-slider-p2').value = type === 'extinct' ? 0.2 : type === 'quenching' ? 0.38 : 2.0;
        document.getElementById('d-slider-p3').value = 1.0;
        document.getElementById('d-slider-p4').value = 5.0;
    } else if (key === 'flex2') {
        document.getElementById('d-slider-p1').value = type === 'extinct' ? 12.0 : type === 'quenching' ? 16.5 : 21.0;
        document.getElementById('d-slider-p2').value = type === 'extinct' ? 35.0 : type === 'quenching' ? 25.0 : 5.0;
        document.getElementById('d-slider-p3').value = 300;
        document.getElementById('d-slider-p4').value = 2.0;
    } else if (key === 'cool') {
        document.getElementById('d-slider-p1').value = type === 'extinct' ? 42.0 : type === 'quenching' ? 28.0 : 8.5;
        document.getElementById('d-slider-p2').value = type === 'extinct' ? 150.0 : type === 'quenching' ? 110.0 : 35.0;
        document.getElementById('d-slider-p3').value = 3.4;
        document.getElementById('d-slider-p4').value = 75;
    }

    updateDissipationSim();
}

function updateDissipationSim() {
    const key = document.getElementById('suppressor-select').value;
    const cfg = DISSIPATION_CONFIG[key];

    const v1 = parseFloat(document.getElementById('d-slider-p1').value);
    const v2 = parseFloat(document.getElementById('d-slider-p2').value);
    const v3 = parseFloat(document.getElementById('d-slider-p3').value);
    const v4 = parseFloat(document.getElementById('d-slider-p4').value);

    document.getElementById('d-val-p1').textContent = `${v1.toFixed(1)} ${cfg.p1.unit}`;
    document.getElementById('d-val-p2').textContent = `${v2.toFixed(2)} ${cfg.p2.unit}`;
    document.getElementById('d-val-p3').textContent = `${v3.toFixed(1)} ${cfg.p3.unit}`;
    document.getElementById('d-val-p4').textContent = `${v4.toFixed(1)} ${cfg.p4.unit}`;

    let logs = [];
    let isExtinct = false;
    let statusText = 'STATUS: FLAME SUSTAINED';
    let statusStyle = 'background: rgba(84,214,160,0.15); color: #71d5ae; border: 1px solid rgba(84,214,160,0.35);';
    let actionText = 'ACTION: MONITORING COMBUSTION';
    let actionStyle = 'background: rgba(98,201,245,0.15); color: var(--accent-cyan); border: 1px solid rgba(98,201,245,0.3);';

    if (key === 'flex') {
        if (v1 > 60 || v2 < 0.4) {
            isExtinct = true;
            logs.push({ type: 'ok', text: `[PSI-69] Thermal cooling (${v1} K/s) or droplet envelope ($d_0 = ${v2} mm$) reached critical extinction boundary.` });
        } else if (v1 > 35) {
            logs.push({ type: 'warn', text: `[PSI-69] High thermal absorption rate; droplet vaporization accelerating.` });
        } else {
            logs.push({ type: 'info', text: `[PSI-69] FLEX Droplet burning steadily under microgravity.` });
        }
    } else if (key === 'flex2') {
        if (v1 < 14.0 || v2 > 28.0) {
            isExtinct = true;
            logs.push({ type: 'ok', text: `[PSI-68] Oxygen depletion (${v1}%) or diluent ratio (${v2}%) successfully suppressed combustion.` });
        } else if (v1 < 18.0 || v2 > 15.0) {
            logs.push({ type: 'warn', text: `[PSI-68] Chamber oxygen mole fraction approaching flammability limit.` });
        } else {
            logs.push({ type: 'info', text: `[PSI-68] FLEX-2 atmospheric chamber composition nominal.` });
        }
    } else if (key === 'cool') {
        if (v1 > 25.0 || v2 > 100.0) {
            isExtinct = true;
            logs.push({ type: 'ok', text: `[PSI-142] Radiation loss (${v1} kW/m²) or scalar dissipation (${v2} s⁻¹) induced stretch extinction.` });
        } else if (v1 > 15.0 || v2 > 70.0) {
            logs.push({ type: 'warn', text: `[PSI-142] Cool flame counterflow gradient showing thermal instability.` });
        } else {
            logs.push({ type: 'info', text: `[PSI-142] Counterflow cool flame equilibrium stable.` });
        }
    }

    if (isExtinct) {
        statusText = 'STATUS: COMPLETE FLAME EXTINCTION';
        statusStyle = 'background: rgba(98,201,245,0.15); color: #62c9f5; border: 1px solid rgba(98,201,245,0.4);';
        actionText = 'ACTION: QUENCHING / STRETCH LIMIT ACHIEVED';
        actionStyle = 'background: rgba(84,214,160,0.15); color: #71d5ae; border: 1px solid rgba(84,214,160,0.3);';
    }

    document.getElementById('extinction-state-badge').textContent = statusText;
    document.getElementById('extinction-state-badge').style.cssText = `font-size: 11px; font-weight: 700; font-family: monospace; padding: 4px 10px; border-radius: 4px; ${statusStyle}`;
    document.getElementById('extinction-action-badge').textContent = actionText;
    document.getElementById('extinction-action-badge').style.cssText = `width: 100%; padding: 8px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace; ${actionStyle}`;

    // Actualizar Gráfica dinámicamente con los valores de los sliders
    if (dissipationChartInstance) {
        const m1 = Math.min(100, (v1 / cfg.p1.max) * 100);
        const m2 = Math.min(100, (v2 / cfg.p2.max) * 100);
        const m3 = Math.min(100, (v3 / cfg.p3.max) * 100);
        const m4 = Math.min(100, (v4 / cfg.p4.max) * 100);

        dissipationChartInstance.data.datasets[0].data = [m1.toFixed(1), m2.toFixed(1), m3.toFixed(1), m4.toFixed(1)];
        dissipationChartInstance.update();
    }

    const core = document.getElementById('droplet-visual-core');
    const caption = document.getElementById('droplet-status-caption');
    if (isExtinct) {
        core.style.width = '14px';
        core.style.height = '14px';
        core.style.background = '#64748b';
        core.style.boxShadow = '0 0 5px #64748b';
        caption.textContent = `Extinction confirmed via ${cfg.ref} parameters.`;
    } else {
        core.style.width = '50px';
        core.style.height = '50px';
        core.style.background = 'radial-gradient(circle, #fef08a 20%, #f97316 60%, #ef4444 90%)';
        core.style.boxShadow = '0 0 25px #f97316';
        caption.textContent = `Stable combustion envelope under microgravity (${cfg.ref}).`;
    }

    const logBox = document.getElementById('dissipation-log-container');
    logBox.innerHTML = logs.map(l => {
        let col = '#71d5ae', icon = '✓';
        if (l.type === 'warn') { col = '#fbbf24'; icon = '⚠'; }
        if (l.type === 'info') { col = '#62c9f5'; icon = 'ℹ'; }
        return `<div style="color: ${col}; margin-bottom: 5px;">${icon} ${l.text}</div>`;
    }).join('');
}

function resizeDissipationChart() {
    if (dissipationChartInstance) dissipationChartInstance.resize();
}