async function onSignUp() {

    const email = $('#emailSignUp').val();
    const name = $('#nameSignUp').val();
    const username = $('#usernameSignUp').val();
    const password = $('#passwordSignUp').val();
    const confirmPassword = $('#confirmPasswordSignUp').val();

    checkSignupFields(email, name, username, password, confirmPassword);
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

        const data = await response.json();

        document.getElementById('successPopupSignup').style.display = 'flex';
        console.log('User authenticated successfully:', data);

    } catch (error) {
        console.error('Error signing up:', error);
    }
}

function checkSignupFields(email, name, username, password, confirmPassword) {
    if (email === '' && name === '' && username === '' && password === '') {
        displaySignupErrorMessage('Ops! All fields are empty.');
        return;
    }
    if (email === '') {
        displaySignupErrorMessage('Ops! Email field is empty.');
        return;
    }
    if (name === '') {
        displaySignupErrorMessage('Ops! Name field is empty.');
        return;
    }
    if (username === '') {
        displaySignupErrorMessage('Ops! Username field is empty.');
        return;
    }
    if (password === '') {
        displaySignupErrorMessage('Ops! Password field is empty.');
        return;
    }
    if (confirmPassword === '') {
        displaySignupErrorMessage('Ops! Confirm Password field is empty.');
        return;
    }
    if (password !== confirmPassword) {
        displaySignupErrorMessage('Ops! Passwords do not match.');
        return;
    }
    if (password.length < 8) {
        displaySignupErrorMessage('Ops! Password must have at least 8 characters.');
        return;
    }
}

function displaySignupErrorMessage(message) {
    $('#error-msg-signup').text(message);
}

function clearSignupFields() {
    $('#emailInput').val('');
    $('#passwordInput').val('');
}