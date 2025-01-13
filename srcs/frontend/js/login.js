async function onLogin() {
    const email = $('#emailInput').val();
    const password = $('#passwordInput').val();

    if (email === '' && password === '') {
        displayLoginErrorMessage('Ops! Email and Password fields are empty.');
        return;
    }
    if (email === '') {
        displayLoginErrorMessage('Ops! Email field is empty.');
        return;
    }
    if (password === '') {
        displayLoginErrorMessage('Ops! Password field is empty.');
        return;
    }

    try {
        
        const response = await fetch('/api/authentication/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            clearLoginFields();
            displayLoginErrorMessage('Ops! Your credentials are incorrect. Please try again.');
            throw new Error('Login failed!');
        }

        const data = await response.json();
        console.log('User authenticated successfully:', data);
        loadContent('menu');
        //window.app = new App();

        if (response.ok) {
            localStorage.setItem('refresh-token', data.refresh);
            localStorage.setItem('access-token', data.access);
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
}


function displayLoginErrorMessage(message) {
    $('#error-msg-login').text(message);
}

function clearLoginFields() {
    $('#emailInput').val('');
    $('#passwordInput').val('');
}