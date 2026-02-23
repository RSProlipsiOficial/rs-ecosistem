const xlsx = require('xlsx');

const filePath = 'd:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx';

function debugOwnersInSheet() {
    try {
        const workbook = xlsx.readFile(filePath);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const owners = ['Allana', 'Marilza', 'Beto', 'Rota Fácil', 'RS Prólipsi'];

        console.log('--- BUSCANDO PROPRIETÁRIOS NA PLANILHA ---');
        owners.forEach(name => {
            const found = data.filter(r =>
                (r.Nome && r.Nome.toLowerCase().includes(name.toLowerCase())) ||
                (r.Login && r.Login.toLowerCase().includes(name.toLowerCase()))
            );
            console.log(`\nResultados para [${name}]:`, found.length);
            found.forEach(r => console.log(`- Nome: ${r.Nome} | Login: ${r.Login} | Indicador: ${r.Indicador}`));
        });

    } catch (error) {
        console.error(error);
    }
}

debugOwnersInSheet();
