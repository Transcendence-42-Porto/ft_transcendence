async function onSignUp() {

    const email = $('#emailSignUp').val();
    const name = $('#nameSignUp').val();
    const username = $('#usernameSignUp').val();
    const password = $('#passwordSignUp').val();
    const confirmPassword = $('#confirmPasswordSignUp').val();

    if (!checkSignupFields(email, name, username, password, confirmPassword))
        return;
    try {



        const response = await fetch('/api/authentication/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                username,
                password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();

            let errorMessages = '';
            for (let key in errorData) {
                if (errorData.hasOwnProperty(key)) {
                    errorMessages += `${key}: ${errorData[key].join(', ')}\n`;
                }
            }

            displaySignupErrorMessage(errorMessages || 'Ops! Sign-up failed. Please try again.');
            throw new Error('Sign-up failed!');
        }

        const qrCodeCreated = await createQrCode(username);

        if (qrCodeCreated) {
            const data = await response.json();
            document.getElementById('successPopupSignup').style.display = 'flex';  
            console.log('User authenticated successfully:', data);
        } else {
            console.error("QR code creation failed. Rolling back user creation...");
            // Call API to delete user or handle rollback logic
        }
        
    } catch (error) {
        console.error('Error signing up:', error);
    }
}

async function createQrCode(username) {
    try {
        const response = await fetch('http://localhost:7575/qrcode/gen/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            console.error('Failed to create QR code');
            return false; // Retorna false em caso de falha
        }

        const data = await response.json(); // Aguarda e processa o JSON
        document.getElementById('qrcode').src = `data:image/png;base64,${data.qrcode}`;
        console.log("QR code created successfully");
        return true; // Retorna true em caso de sucesso
    } catch (error) {
        console.error('Error creating QR code:', error);
        return false; // Retorna false em caso de erro
    }
}


function checkSignupFields(email, name, username, password, confirmPassword) {
    if (email === '' && name === '' && username === '' && password === '') {
        displaySignupErrorMessage('Ops! All fields are empty.');
        return false;
    }
    if (email === '') {
        displaySignupErrorMessage('Ops! Email field is empty.');
        return false;
    }
    if (name === '') {
        displaySignupErrorMessage('Ops! Name field is empty.');
        return false;
    }
    if (username === '') {
        displaySignupErrorMessage('Ops! Username field is empty.');
        return false;
    }
    if (password === '') {
        displaySignupErrorMessage('Ops! Password field is empty.');
        return false;
    }
    if (confirmPassword === '') {
        displaySignupErrorMessage('Ops! Confirm Password field is empty.');
        return false;
    }
    if (password !== confirmPassword) {
        displaySignupErrorMessage('Ops! Passwords do not match.');
        return false;
    }
    if (password.length < 8) {
        displaySignupErrorMessage('Ops! Password must have at least 8 characters.');
        return false;
    }
    return true;
}

function displaySignupErrorMessage(message) {
    $('#error-msg-signup').text(message);
}

function clearSignupFields() {
    $('#emailInput').val('');
    $('#passwordInput').val('');
}