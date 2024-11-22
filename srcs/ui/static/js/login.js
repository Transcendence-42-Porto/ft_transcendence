async function onLogin() {

    let email = document.getElementById('emailInput').value;
    let password = document.getElementById('passwordInput').value;
    let data = {
        email: email,
        password: password,
    };
    console.log(data);
    try {
        const response = await fetch('/api/authentication/sign-in', {
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

        const data = await response.json();
        console.log('Usuário autenticado com sucesso:', data);
        
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
}

async function onSignUp(){
    let email = document.getElementById('emailSignUp').value;
    let name = document.getElementById('nameSignUp').value;
    let username = document.getElementById('usernameSignUp').value;
    let password = document.getElementById('passwordSignUp').value;
    let data = {
        name : name,
        username: username,
        email: email,
        password: password,
    };
    console.log(data);
    try {
        const response = await fetch('/api/authentication/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('Sign-up falhou!');
        }

        const data = await response.json();
        console.log('Usuário autenticado com sucesso:', data);
        
    } catch (error) {
        console.error('Erro ao fazer sign-up:', error);
    }
}
