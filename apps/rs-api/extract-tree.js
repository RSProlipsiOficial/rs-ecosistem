const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = 'd:\\Rs  Ecosystem\\rs-ecosystem\\Documentação RS Prólipsi (Ver Sempre)\\Rede da RS Prólipsi Completo.xlsx';

function extractOfficialTree() {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const tree = {}; // { nomeConsultor: patrocinadorNome }

        data.forEach(row => {
            if (row.Nome && row.Indicador) {
                tree[row.Nome.toLowerCase().trim()] = row.Indicador.toLowerCase().trim();
            }
        });

        console.log('--- ÁRVORE OFICIAL EXTRAÍDA ---');
        console.log('Total registros:', Object.keys(tree).length);

        // Salvar para uso no script de sync
        fs.writeFileSync(path.join(__dirname, 'official_tree.json'), JSON.stringify(tree, null, 2));
        console.log('Salvo em external/official_tree.json');

        // Amostra: Ver quem o Robert indica
        const directsOfRobert = data.filter(row => row.Indicador && row.Indicador.toLowerCase().includes('robertojbcamargo'));
        console.log('\nExemplo: Indicados diretos do login "robertojbcamargo":', directsOfRobert.length);

    } catch (error) {
        console.error('Erro na extração:', error);
    }
}

extractOfficialTree();
