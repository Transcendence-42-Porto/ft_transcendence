import tokenManager from './token.js';
import CookieManager from './cookieManager.js';

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
        if (data.access) {
            tokenManager.setAccessToken(data.access);
            console.log('Access token set!');
            console.log("token:", tokenManager.accessToken);

            CookieManager.setCookie("userId", data.id, 1); 
            console.log("userId:", CookieManager.getCookie("userId"));
        }
        // loadContent('menu');
        //window.app = new App();

        if (response.ok) {
            const access_token = data.access;
        }

        const authenticatorModal = new bootstrap.Modal(document.getElementById('authenticatorModal'));
        authenticatorModal.show();

    } catch (error) {
        console.error('Error logging in:', error);
    }
}

window.onLogin = onLogin;
window.verifyAuthenticationCode = verifyAuthenticationCode;

function clearLoginFields() {
    $('#emailInput').val('');
    $('#passwordInput').val('');
}

function verifyAuthenticationCode() {
    loadContent('menu');
    
    const authenticatorModalElement = document.getElementById('authenticatorModal');
    if (authenticatorModalElement) {
        const authenticatorModal = bootstrap.Modal.getInstance(authenticatorModalElement);
        if (authenticatorModal) {
            authenticatorModal.hide();
        }
    }
}