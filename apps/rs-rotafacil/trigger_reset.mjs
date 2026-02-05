
const supabaseUrl = "https://rptkhrboejbwexseikuo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTQ4OTEsImV4cCI6MjA3MjU5MDg5MX0.lZdg0Esgxx81g9gO0IDKZ46a_zbyapToRqKSAg5oQ4Y";

async function testPasswordReset() {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-responsavel-account`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
            email: "reset_test@example.com",
            password: "123456",
            nome: "Reset Test",
            aluno_id: "aad81399-c00c-494b-874d-2c575dd6afcb", // Adrielly
            cpf: "000.000.000-00"
        })
    });

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

testPasswordReset();
