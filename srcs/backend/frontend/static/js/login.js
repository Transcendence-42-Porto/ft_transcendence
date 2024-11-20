function onLogin()
{
    let username = document.getElementById('usernameInput').value;
    let password = document.getElementById('passwordInput').value;
    let data = {
        username: username,
        password: password
    };
    console.log(data);
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.href = '/home';
        } else {
            alert('Invalid username or password');
        }
    });
}
