const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const instanceName = 'Rota Fácil';
    console.log(`Buscando instância: ${instanceName}...`);

    try {
        const deleted = await prisma.instance.deleteMany({
            where: {
                name: instanceName
            }
        });
        console.log(`Sucesso! ${deleted.count} instância(s) removida(s).`);
    } catch (e) {
        console.error('Erro ao deletar:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
