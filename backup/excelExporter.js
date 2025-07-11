// js/excelExporter.js

export const exportTableToExcel = (data, filename = 'export_data') => {
    if (!data || data.length === 0) {
        console.warn("Nenhum dado para exportar.");
        return;
    }

    // Define os cabeçalhos que queremos exportar e a ordem
    const headers = [
        "TAG",
        "Equipamento",
        "Modelo",
        "Fabricante",
        "Setor",
        "Nº Série",
        "Patrimônio",
        "Status Calibração",
        "Data Vencimento Calibração",
        "Status Manutenção" // Adicionado o cabeçalho de manutenção para exportação
    ];

    // Mapeia os dados para o formato que a planilha espera, na ordem correta dos cabeçalhos
    const exportRows = data.map(item => {
        let row = {};
        headers.forEach(header => {
            // Garante que o valor de maintenanceStatus seja exportado corretamente
            if (header === "Status Manutenção") {
                row[header] = item.maintenanceStatus !== undefined ? item.maintenanceStatus : '';
            } else {
                row[header] = item[header] !== undefined ? item[header] : '';
            }
        });
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportRows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Resultados");

    XLSX.writeFile(wb, `${filename}.xlsx`);
};
