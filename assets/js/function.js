const addRowButton = document.getElementById('add-row');
const downloadButton = document.getElementById('download');
const deleteRowButton = document.getElementById('delete-row');
const dataTable = document.getElementById('data-table');
const grandTotalElement = document.getElementById('grand-total');

// Función para actualizar los totales
function updateTotals() {
    let grandTotal = 0;

    dataTable.querySelectorAll('tbody tr').forEach(row => {
        const conesInput = row.querySelector('.cones-input');
        const cupsInput = row.querySelector('.cups-input');
        const expensesInput = row.querySelector('.expenses-input');
        const totalCell = row.querySelector('.total-cell');

        const conesValue = parseFloat(conesInput.innerText) || 0;
        const cupsValue = parseFloat(cupsInput.innerText) || 0;
        const expensesValue = parseFloat(expensesInput.innerText) || 0;

        // Suponiendo que estos valores están almacenados en el local storage
        const conePrice = parseFloat(localStorage.getItem('conesValue')) || 0;
        const cupPrice = parseFloat(localStorage.getItem('cupsValue')) || 0;

        // Calcular el total para la fila actual
        const total = (conesValue * conePrice) + (cupsValue * cupPrice) - expensesValue;

        totalCell.innerText = total.toFixed(2); // Actualizar la celda total
        grandTotal += total; // Sumar al total general
    });

    grandTotalElement.innerText = grandTotal.toFixed(2); // Actualizar la visualización del total general
}

// Función para manejar el evento de cambio en celdas editables
function handleInputChange() {
    updateTotals(); // Actualiza totales al cambiar cualquier celda
    saveData(); // Guardar datos cada vez que se cambia una celda
}

// Función para guardar datos en localStorage
function saveData() {
    const rowsData = [];
    dataTable.querySelectorAll('tbody tr').forEach(row => {
        const rowData = {
            name: row.cells[0].innerText,
            cones: row.cells[1].innerText,
            cups: row.cells[2].innerText,
            expenses: row.cells[3].innerText,
            total: row.cells[4].innerText
        };
        rowsData.push(rowData);
    });
    localStorage.setItem('tableData', JSON.stringify(rowsData));
}

// Función para cargar datos desde localStorage
function loadData() {
    const storedData = localStorage.getItem('tableData');
    if (storedData) {
        const rowsData = JSON.parse(storedData);
        // Limpiar la tabla antes de agregar filas
        const tbody = dataTable.querySelector('tbody');
        tbody.innerHTML = ''; // Limpia las filas existentes
        
        rowsData.forEach(data => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td contenteditable="true">${data.name}</td>
                <td contenteditable="true" class="cones-input">${data.cones}</td>
                <td contenteditable="true" class="cups-input">${data.cups}</td>
                <td contenteditable="true" class="expenses-input">${data.expenses}</td>
                <td class="total-cell">${data.total}</td>
            `;
            const inputs = newRow.querySelectorAll('[contenteditable="true"]');
            inputs.forEach(input => {
                input.addEventListener('input', handleInputChange);
            });
            tbody.appendChild(newRow);
        });
        updateTotals(); // Actualizar totales después de cargar los datos
    }
}

// Funcionalidad para agregar fila
addRowButton.addEventListener('click', () => {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td contenteditable="true"></td>
        <td contenteditable="true" class="cones-input"></td>
        <td contenteditable="true" class="cups-input"></td>
        <td contenteditable="true" class="expenses-input"></td>
        <td class="total-cell">0.00</td>
    `;
    
    // Agregar event listeners para los inputs
    const inputs = newRow.querySelectorAll('[contenteditable="true"]');
    inputs.forEach(input => {
        input.addEventListener('input', handleInputChange);
    });

    dataTable.querySelector('tbody').appendChild(newRow);
    updateTotals(); // Actualizar totales después de agregar una fila
    saveData(); // Guardar datos cada vez que se agrega una fila
});

// Funcionalidad para eliminar fila
deleteRowButton.addEventListener('click', () => {
    const selectedRow = document.querySelector('tbody tr.selected');
    if (selectedRow) {
        selectedRow.remove();
        updateTotals(); // Actualizar totales después de eliminar una fila
        saveData(); // Guardar datos después de eliminar una fila
    }
});

// Funcionalidad de descarga
downloadButton.addEventListener('click', () => {
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];

    // Obtener encabezados
    const headers = [];
    dataTable.querySelectorAll('th').forEach(th => {
        headers.push(th.innerText);
    });
    worksheetData.push(headers);

    // Obtener filas
    dataTable.querySelectorAll('tbody tr').forEach((row) => {
        const rowData = [];
        row.querySelectorAll('td').forEach(td => {
            rowData.push(td.innerText);
        });
        worksheetData.push(rowData);
    });

    // Agregar total general a la última fila
    const grandTotal = parseFloat(grandTotalElement.innerText) || 0;
    worksheetData.push(['Grand Total', '', '', '', grandTotal.toFixed(2)]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'table_data.xlsx');
});

// Resaltar fila al hacer clic para eliminación
dataTable.addEventListener('click', (event) => {
    const row = event.target.closest('tr');
    if (row && row.parentElement.tagName === 'TBODY') {
        dataTable.querySelectorAll('tbody tr').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
    }
});

// Cargar datos al iniciar
loadData();
