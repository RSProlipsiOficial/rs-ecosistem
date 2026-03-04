const fetch = require('node-fetch');

async function testApi() {
    const cdId = 'd107da4e-e266-41b0-947a-0c66b2f2b9ef';

    // Test getReplenishmentOrders
    const resOrders = await fetch(`http://localhost:4000/v1/cds/orders?cdId=${cdId}`);
    const jsonOrders = await resOrders.json();
    console.log("Replenishment Orders Response:", JSON.stringify(jsonOrders, null, 2));

    // Test inventory
    const resInv = await fetch(`http://localhost:4000/v1/cds/${cdId}/inventory`);
    const jsonInv = await resInv.json();
    console.log("\nInventory Response:", JSON.stringify(jsonInv, null, 2));
}

testApi();
