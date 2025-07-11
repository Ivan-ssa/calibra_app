// js/tableRenderer.js

/**
 * Renderiza a tabela de equipamentos com os dados fornecidos.
 * @param {Array<Object>} equipments - O array de objetos de equipamentos a serem exibidos.
 * @param {HTMLElement} tableBodyElement - O elemento <tbody> da tabela.
 * @param {Map<string, Object>} consolidatedCalibratedMap - Mapa SN -> { fornecedor, dataCalibracao }.
 * @param {Set<string>} externalMaintenanceSNs - Um conjunto de Números de Série em manutenção externa.
 */
export function renderTable(equipments, tableBodyElement, consolidatedCalibratedMap, externalMaintenanceSNs) { 
    tableBodyElement.innerHTML = ''; 

    if (equipments.length === 0) {
        const row = tableBodyElement.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 10; 
        cell.textContent = 'Nenhum equipamento encontrado com os filtros aplicados.';
        cell.style.textAlign = 'center';
        return;
    }

    equipments.forEach(equipment => {
        const row = tableBodyElement.insertRow();

        const equipmentSN = String(equipment?.NumeroSerie || '').trim().toLowerCase(); 

        let displayCalibrationStatus = equipment?.StatusCalibacao || ''; 
        let displayMaintenanceStatus = equipment?.StatusManutencao || ''; 
        let displayDataVencimento = equipment?.DataVencimentoCalibacao || ''; 

        // LÓGICA DE COLORAÇÃO E ATUALIZAÇÃO DE STATUS DE CALIBRAÇÃO 
        const calibInfo = consolidatedCalibratedMap.get(equipmentSN); 
        if (calibInfo) {
            row.classList.add('calibrated-dhme'); // Cor verde para QUALQUER equipamento calibrado
            displayCalibrationStatus = `Calibrado (${calibInfo.fornecedor})`; 

            const dataOrigem = parseExcelDate(calibInfo.dataCalibracao); 
            if (dataOrigem instanceof Date && !isNaN(dataOrigem)) {
                displayDataVencimento = formatDate(dataOrigem); 
            } else {
                displayDataVencimento = calibInfo.dataCalibracao; 
            }
        } 
        else {
            // Se não foi calibrado por nenhum fornecedor da consolidação
            const originalCalibStatusLower = String(equipment?.StatusCalibacao || '').toLowerCase();
            if (originalCalibStatusLower.includes('não calibrado') || originalCalibStatusLower.includes('não cadastrado')) {
                 row.classList.add('not-calibrated'); 
                 displayCalibrationStatus = 'Não Calibrado/Não Encontrado (Seu Cadastro)'; 
            } else if (originalCalibStatusLower.includes('calibrado (total)')) {
                displayCalibrationStatus = 'Calibrado (Total)';
                displayDataVencimento = equipment?.DataVencimentoCalibacao || ''; 
            } else {
                displayCalibrationStatus = String(equipment?.StatusCalibacao || '');
                if (displayCalibrationStatus.trim() === '') {
                    displayCalibrationStatus = 'Não Calibrado/Não Encontrado (Seu Cadastro)';
                    row.classList.add('not-calibrated'); 
                } else {
                }
                displayDataVencimento = equipment?.DataVencimentoCalibacao || ''; 
            }
        }

        // LÓGICA DE COLORAÇÃO E ATUALIZAÇÃO DE STATUS DE MANUTENÇÃO EXTERNA
        if (externalMaintenanceSNs.has(equipmentSN)) { 
            row.classList.add('in-external-maintenance'); 
            displayMaintenanceStatus = 'Em Manutenção Externa'; 
        }

        // PREENCHIMENTO DAS CÉLULAS
        row.insertCell().textContent = equipment.TAG ?? '';
        row.insertCell().textContent = equipment.Equipamento ?? '';
        row.insertCell().textContent = equipment.Modelo ?? '';
        row.insertCell().textContent = equipment.Fabricante ?? '';
        row.insertCell().textContent = equipment.Setor ?? '';
        row.insertCell().textContent = equipment.NumeroSerie ?? ''; 
        row.insertCell().textContent = equipment.Patrimonio ?? '';   
        row.insertCell().textContent = displayCalibrationStatus; 
        row.insertCell().textContent = displayDataVencimento; 
        row.insertCell().textContent = displayMaintenanceStatus; 
    });
}

// Helper para converter número de data do Excel para data JS
function parseExcelDate(excelDate) {
    if (typeof excelDate === 'number' && excelDate > 0) {
        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
        date.setHours(0, 0, 0, 0); 
        return date;
    }
    return null;
}

// Helper para formatar data para exibição
function formatDate(date) {
    if (date instanceof Date && !isNaN(date)) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    return '';
}

/**
 * Popula o dropdown de setores com os setores únicos dos equipamentos.
 * @param {Array<Object>} equipments - O array de objetos de equipamentos.
 * @param {HTMLElement} sectorFilterElement - O elemento <select> do filtro de setor.
 */
export function populateSectorFilter(equipments, sectorFilterElement) { 
    sectorFilterElement.innerHTML = '<option value="">Todos os Setores</option>'; 

    const sectors = new Set();
    equipments.forEach(eq => {
        if (eq.Setor && String(eq.Setor).trim() !== '') {
            sectors.add(String(eq.Setor).trim()); 
        }
    });

    Array.from(sectors).sort().forEach(sector => {
        const option = document.createElement('option');
        option.value = sector;
        option.textContent = sector;
        sectorFilterElement.appendChild(option);
    });
}

/**
 * Atualiza o contador de equipamentos exibidos.
 * @param {number} count - O número de equipamentos a ser exibido.
 */
export function updateEquipmentCount(count) { 
    document.getElementById('equipmentCount').textContent = `Total: ${count} equipamentos`;
}