async function onLogin() {

    let email = document.getElementById('emailInput').value;
    let password = document.getElementById('passwordInput').value;
    let data = {
        email: email,
        password: password
    };
    console.log(data);
    try {
        const response = await fetch('http://localhost:8001/api/authentication/sign_in/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('Login falhou!');
        }

        // Caso o login seja bem-sucedido, processa a resposta
        const data = await response.json();
        console.log('Usuário autenticado com sucesso:', data);

        // Aqui você pode redirecionar para a página inicial ou fazer algo mais
        // Por exemplo, salvar o token no localStorage ou sessionStorage, se aplicável:
        // localStorage.setItem('auth_token', data.token);
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
}
