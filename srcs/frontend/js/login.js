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
            CookieManager.setCookie("userId", data.id, 1); 
        }
        const authenticatorModal = new bootstrap.Modal(document.getElementById('authenticatorModal'));
        authenticatorModal.show();

    } catch (error) {
    }
}


function clearLoginFields() {
    $('#emailInput').val('');
    $('#passwordInput').val('');
}

async function verifyAuthenticationCode() {
    let code = $('#number1').val() + $('#number2').val() + $('#number3').val() + $('#number4').val() + $('#number5').val() + $('#number6').val();
    let email = $('#emailInput').val();

    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.style.display = 'none';
    }

    try {
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
            if (errorMessageElement) {
                errorMessageElement.style.display = 'block';
                errorMessageElement.textContent = 'Invalid code. Please try again.'; 
            }
            return;
        }

        const data = await response.json();
        tokenManager.setAccessToken(data.access_token);
        loadContent('game');

        const authenticatorModalElement = document.getElementById('authenticatorModal');
        if (authenticatorModalElement) {
            const authenticatorModal = bootstrap.Modal.getInstance(authenticatorModalElement);
            if (authenticatorModal) {
                authenticatorModal.hide();
            }
        }
    } catch (error) {
        if (errorMessageElement) {
            errorMessageElement.style.display = 'block';
            errorMessageElement.textContent = 'An unexpected error occurred. Please try again later.';
        }
    }
}

function checkInputs() {
    const inputs = document.querySelectorAll('#authenticatorModal input');
    const allFilled = Array.from(inputs).every(input => input.value.length === 1);
    document.getElementById('verifyButton').disabled = !allFilled;
}

function moveFocus(event, nextInputId) {
    checkInputs();
    
    if (event.target.value.length === 1) {
        const nextInput = document.getElementById(nextInputId);
        if (nextInput) {
            nextInput.focus();
        }
    }
}

function moveFocusOnDelete(event, previousInputId) {
    if (event.key === "Backspace" && event.target.value.length === 0) {
        const previousInput = document.getElementById(previousInputId);
        if (previousInput) {
            previousInput.focus();
        }
    }
}


function displayLoginErrorMessage(msg) {
    let errorMsg = document.getElementById('error-msg-login');
    errorMsg.textContent = msg;
}

window.onLogin = onLogin;
window.verifyAuthenticationCode = verifyAuthenticationCode;
window.checkInputs = checkInputs;
window.moveFocus = moveFocus;
window.moveFocusOnDelete = moveFocusOnDelete;