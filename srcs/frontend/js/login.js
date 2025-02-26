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
            console.log("access token:", tokenManager.accessToken);
            CookieManager.setCookie("userId", data.id, 1); 
            console.log("userId:", CookieManager.getCookie("userId"));
        }

        //if (response.ok) {
        //    const access_token = data.access;
        //}

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

async function verifyAuthenticationCode() {
    
    let code = $('#number1').val() + $('#number2').val() + $('#number3').val() + $('#number4').val() + $('#number5').val() + $('#number6').val();
    let email = $('#emailInput').val();
    const response = await fetch('/api/qrcode/verify/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            code
        })
    });

    if (!response.ok) {
        console.log('Invalid code');
        return;
    }
    else 
    {
        const data = await response.json();
        console.log('Code verified. New data:', data);
        tokenManager.setAccessToken(data.access_token);
        console.log("access token:", tokenManager.accessToken);
        loadContent('game');
        const authenticatorModalElement = document.getElementById('authenticatorModal');
        if (authenticatorModalElement) {
            const authenticatorModal = bootstrap.Modal.getInstance(authenticatorModalElement);
            if (authenticatorModal) {
                authenticatorModal.hide();
            }
        }
    }
}

function displayLoginErrorMessage(msg) {
    let errorMsg = document.getElementById('error-msg-login');
    errorMsg.textContent = msg;
}