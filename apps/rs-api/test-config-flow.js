require('dotenv').config();

const API_BASE = process.env.API_BASE || 'http://localhost:8080';

async function testConfigFlow() {
    // Dynamic import for node-fetch (ESM module)
    const fetch = (await import('node-fetch')).default;

    console.log('='.repeat(80));
    console.log('DYNAMIC CONFIG VALIDATION - PHASE A');
    console.log('Testing rs-admin -> rs-api -> Supabase flow');
    console.log('='.repeat(80));
    console.log();

    try {
        // Step 1: GET current config
        console.log('📖 Step 1: GET /admin/sigma/matrix/config');
        console.log('-'.repeat(80));
        const getResponse1 = await fetch(`${API_BASE}/admin/sigma/matrix/config`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!getResponse1.ok) {
            console.error(`❌ GET failed with status: ${getResponse1.status}`);
            const errorText = await getResponse1.text();
            console.error(`Error: ${errorText}`);
            return;
        }

        const currentConfig = await getResponse1.json();
        console.log('✅ Current Configuration:');
        console.log(JSON.stringify(currentConfig, null, 2));
        console.log();

        const originalCycleValue = currentConfig.cycleValue;
        console.log(`📊 Original cycle_value: ${originalCycleValue}`);
        console.log();

        // Step 2: PUT updated config
        const newCycleValue = originalCycleValue === 360 ? 400 : 360;
        console.log('📝 Step 2: PUT /admin/sigma/matrix/config');
        console.log('-'.repeat(80));
        console.log(`🔄 Changing cycle_value from ${originalCycleValue} to ${newCycleValue}`);

        const putPayload = {
            cycleValue: newCycleValue,
            compression: currentConfig.compression,
            reentry: currentConfig.reentry
        };

        const putResponse = await fetch(`${API_BASE}/admin/sigma/matrix/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(putPayload)
        });

        if (!putResponse.ok) {
            console.error(`❌ PUT failed with status: ${putResponse.status}`);
            const errorText = await putResponse.text();
            console.error(`Error: ${errorText}`);
            return;
        }

        const putResult = await putResponse.json();
        console.log('✅ PUT Response:');
        console.log(JSON.stringify(putResult, null, 2));
        console.log();

        // Step 3: GET again to verify
        console.log('📖 Step 3: GET /admin/sigma/matrix/config (verify update)');
        console.log('-'.repeat(80));

        const getResponse2 = await fetch(`${API_BASE}/admin/sigma/matrix/config`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!getResponse2.ok) {
            console.error(`❌ GET failed with status: ${getResponse2.status}`);
            return;
        }

        const updatedConfig = await getResponse2.json();
        console.log('✅ Updated Configuration:');
        console.log(JSON.stringify(updatedConfig, null, 2));
        console.log();

        // Verify the change
        console.log('🔍 VERIFICATION:');
        console.log('-'.repeat(80));
        console.log(`Original cycle_value: ${originalCycleValue}`);
        console.log(`Expected cycle_value: ${newCycleValue}`);
        console.log(`Actual cycle_value:   ${updatedConfig.cycleValue}`);

        if (updatedConfig.cycleValue === newCycleValue) {
            console.log('✅ SUCCESS: Config was updated correctly!');
        } else {
            console.log('❌ FAILURE: Config was NOT updated correctly!');
        }
        console.log();

        // Restore original value
        console.log('🔄 Step 4: Restoring original value');
        console.log('-'.repeat(80));
        const restorePayload = {
            cycleValue: originalCycleValue,
            compression: currentConfig.compression,
            reentry: currentConfig.reentry
        };

        await fetch(`${API_BASE}/admin/sigma/matrix/config`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(restorePayload)
        });
        console.log(`✅ Restored cycle_value to ${originalCycleValue}`);
        console.log();

    } catch (error) {
        console.error('❌ Test failed with error:');
        console.error(error);
    }

    console.log('='.repeat(80));
    console.log('PHASE A COMPLETE');
    console.log('='.repeat(80));
}

testConfigFlow();
