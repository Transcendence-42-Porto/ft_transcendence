import CookieManager from "./cookieManager.js";
import tokenManager from "./token.js";
    // Função para carregar a lista de amigos
    

    async function loadPersonalInfo() {
      let data = ""; 

      const userId = CookieManager.getCookie('userId');
      if (!userId) {
        return;
      }
      const response = await fetch(`/api/users/${userId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
        }
      });
      if (response.ok) {
        data = await response.json();
      }
      return data; 
    }

    async function loadProfile() {
      const data = await loadPersonalInfo(); 

      const profilePic = data.avatar ? data.avatar : getRandomAvatar();
      const name = data.name ? data.name : data.username;
      const username = "@"+ data.username;
      const email = data.email;

      document.getElementById('profile-pic').src = profilePic;
      document.getElementById('profile-name').textContent = name;
      document.getElementById('profile-username').textContent = username;
      document.getElementById('profile-email').textContent = email;
    }

    async function loadEditProfile() {
      try {
        const data = await loadPersonalInfo(); // Fetch the data from your API
    
        // Handle API data and provide fallback values
        const profilePic = data.avatar || getRandomAvatar(); // Default avatar if not provided
        const name = data.name || ""; // Default empty name
        const username = data.username ? "@" + data.username : ""; // Default empty username
        const email = data.email || ""; // Default empty email
    
        // Populate modal fields with fetched data
        document.getElementById('editProfilePic').src = profilePic;
        document.getElementById('editName').value = name;
        document.getElementById('editUsername').value = username;
        document.getElementById('editEmail').value = email;
      } catch (error) {
        console.error("Error loading profile data:", error);
        // Optionally, display an error message in the modal or alert the user
      }
    }

    
    // const dummyFriends = [16];
    
    // const responseAddFriends = await fetch(`/api/users/${userId}/`, {
      //   method: 'PATCH',
      //   headers: {
        //     'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
        //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ friends: dummyFriends })
    // });
    
    // if (responseAddFriends.ok) {
      //   const data = await responseAddFriends.json();
      //   console.log(data);
      // } else {
        //   console.error("Error adding dummy friends:", responseAddFriends.statusText);
        // }


    async function loadFriendsList() {

      const data = await loadPersonalInfo();
      const tableBody = $('#friendsListModal tbody');
      let friends = 0;
      tableBody.empty();

      if (data && data.friends && data.friends.length > 0) {
        data.friends.forEach(async friendId => {
          const friendResponse = await fetch(`/api/users/${friendId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
        }
          });

          if (friendResponse.ok) {
              friends++;
              const friend = await friendResponse.json();
              const avatar = friend.avatar ? friend.avatar : getRandomAvatar();
              const friendRow = `
                <tr>
                  <td><img src="${avatar}" class="rounded-circle img-fluid" width="50" /></td>
                  <td>${friend.username}</td>
                  <td>${friend.email}</td>
                  <td><button class="btn btn-danger btn-sm" onclick="excludeFriend('${friend.id}')">Exclude</button></td>
                </tr>
              `;
              tableBody.append(friendRow);
          }
        });

      }

      if (friends === 0) {
        const noFriendsRow = `<tr><td colspan="4" class="text-center text-muted modal-error-msg"><small>Ops! You have no friends yet.</small></td></tr>`;
        tableBody.append(noFriendsRow);
      }
        const friendsModal = new bootstrap.Modal(document.getElementById('friendsListModal'));
        friendsModal.show();
    }


// async function searchFriend(){
  
//   try {
//     const users = await fetch(`/api/users/`, {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${tokenManager.getAccessToken()}`,
//         'Content-Type': 'application/json',
//       }
//     });
//     if(users.ok)
//     {
//       let dataUsers = await users.json();

//       const tableBody = $('#friendsListModal tbody');
//       tableBody.empty();

//       console.log(dataUsers);
//     }
//   }
//   catch(error)
//   {
//     console.error("Error: ", error)
//   }


//   const searchInput = document.getElementById('searchFriendInput').value;
//   try
//   {
//     const searchInput = document.getElementById('searchFriendInput').value;
  
//       const response = await fetch(`/api/users/add-friends/`, {
//         method: 'PATCH',
//         headers: {
//           Authorization: `Bearer ${tokenManager.getAccessToken()}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username: searchInput})
//       });
  
//       if(response.ok)
//       {
//         let data = await response.json();
//         console.log(data);
//       }
//   } catch(error){
//     console.error("Error: ", error)
//   }

// }

async function searchFriend() {
  try {
    const searchInput = document.getElementById('searchFriendInput').value;
    if (!searchInput) return; // Don't proceed if search input is empty

    // Fetch all users
    const users = await fetch(`/api/users/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenManager.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (users.ok) {
      let dataUsers = await users.json();

      const tableBody = $('#friendsListModal tbody');
      tableBody.empty(); // Clear existing rows

      // Filter users by username
      const matchingUser = dataUsers.find(user => user.username.toLowerCase().includes(searchInput.toLowerCase()));
      const currentUserId = CookieManager.getCookie('userId');


      // If a matching user is found, add a row to the table
      if (matchingUser && matchingUser.id != currentUserId) {
        const newRow = `
          <tr>
            <td><img src="${matchingUser.avatar}" class="rounded-circle img-fluid" width="50" /></td>
            <td>${matchingUser.username}</td>
            <td>${matchingUser.email}</td>
            <td>
              <button class="btn btn-success btn-sm" onclick="addFriend('${matchingUser.username}')">Add Friend</button>
            </td>
          </tr>
        `;
        tableBody.append(newRow);
      } else {
        // No matching user found
        const noResultRow = `
          <tr>
            <td colspan="4" class="text-center">No user found with that username.</td>
          </tr>
        `;
        tableBody.append(noResultRow);
      }

    } else {
      console.error("Failed to fetch users:", users.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function addFriend(friendUsername) {
  // You can implement the logic to send a friend request or add a friend
  console.log("Adding friend with username:", friendUsername);
  
  try {
    const response = await fetch(`/api/users/add-friends`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenManager.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: friendUsername})
    });

    if(response.ok)
    {
      const data = response.json();
      console.log(data);
    }
  }
  catch (error)
  { 
    console.log("Error: ", error);
  }
};

function getRandomAvatar() {
  const avatars = [
    'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp',
    'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
    'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava4-bg.webp',
    'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava5-bg.webp',
    'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava6-bg.webp',
    'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava7-bg.webp',
    'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava8-bg.webp',
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

window.loadPersonalInfo = loadPersonalInfo;
window.loadFriendsList = loadFriendsList;
window.loadProfile = loadProfile;
window.loadEditProfile = loadEditProfile;
window.onEditFormSubmit = onEditFormSubmit;
window.excludeFriend = excludeFriend;
window.onLogout = onLogout;
window.loadGameHistory = loadGameHistory;
window.openEditProfileModal = openEditProfileModal;
window.searchFriend = searchFriend;
window.addFriend = addFriend;
window.getRandomAvatar = getRandomAvatar;

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get base64 string
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Function to upload image to BBImage
async function uploadImage() {
  const fileInput = document.getElementById('editProfilePic');
  const file = fileInput.files[0]; // Get the file from the input field

  if (!file) {
    console.error('No file selected');
    return;
  }

  try {
    const base64Image = await convertToBase64(file); // Convert image to base64
    const formData = new FormData();
    formData.append('image', base64Image);

    // Send the POST request to BBImage API
    const response = await fetch('https://api.imgbb.com/1/upload?expiration=600&key=a6f7a9d312fbdc0ba9bc2d8f4c72b3b2', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      const imageUrl = data.data.url; // The URL of the uploaded image
      console.log("Image uploaded successfully:", imageUrl);
      return imageUrl; // Return the URL for further use
    } else {
      console.error('Image upload failed:', data.error);
      return null; // Return null if upload fails
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}


async function onEditFormSubmit() {
  try {
    let newName = document.getElementById('editName').value;
    let newEmail = document.getElementById('editEmail').value;
    let newUsername = document.getElementById('editUsername').value.replace('@', '');
    let newAvatarFile = await uploadImage();
    //let newAvatarFile = '';

    const userId = CookieManager.getCookie('userId');
    if (!userId) {
      console.error("User ID not found in cookies.");
      return;
    }

    try {

      const formData = new FormData();
      if(newAvatarFile && newAvatarFile != '')
        formData.append("avatar", newAvatarFile);
      if(newName != '')
        formData.append("name", newName);
      if(newEmail != '')
        formData.append("email", newEmail);
      if(newUsername != '')
        formData.append("username", newUsername);

      const response = await fetch(`/api/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${tokenManager.getAccessToken()}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      await loadProfile();
      const editProfileModalElement = document.getElementById('editProfileModal');
      const editProfileModal = bootstrap.Modal.getInstance(editProfileModalElement);
      editProfileModal.hide();

      return;

    } catch (error) {
      console.error('Error requesting API to update profile:', error);
      $('#editProfileErrorMsg').html("Ops! There was a problem updating the profile. Try it again later!");
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    $('#editProfileErrorMsg').html("Ops! There was a problem updating the profile. Try it again later!");
  }
}


function openEditProfileModal()
{
  const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
  editProfileModal.show(); 
}

async function excludeFriend(id) {
  const userId = CookieManager.getCookie('userId');
  if (!userId) {
    console.error("User ID not found in cookies.");
    return;
  }

  const data = await loadPersonalInfo();
  const friendId = Number(id);
  if (data.friends.indexOf(friendId) === -1) {
    console.error("Friend not found.");
    return;
}
  const updatedFriends = data.friends.filter(friend => friend !== friendId);
  const response = await fetch(`/api/users/${userId}/`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ friends: updatedFriends })
  });

  if (response.ok) {
    console.log('Friend excluded successfully!');
    loadFriendsList(); // Refresh the friends list
  } else {
    console.error("Error excluding friend:", response.statusText);
  }
}

async function onLogout() {
  const logoutErrorMsg = document.getElementById('logoutErrorMsg');
  logoutErrorMsg.textContent = '';
  logoutErrorMsg.style.display = 'block';
  
  try {
    const userId = CookieManager.getCookie('userId');
    if (!userId) {
      console.log('No user ID found, user may already be logged out.');
      return;
    }
    const response = await fetch(`/api/authentication/sign-out`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Logout successful:', data);
      const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
      logoutModal.hide();
  
      loadContent("login");
    } else {
      console.error('Logout failed: ', response.statusText);
      const logoutErrorMsg = document.getElementById('logoutErrorMsg');
      if (logoutErrorMsg) {
        logoutErrorMsg.textContent = 'An error occurred while logging out. Please try again.';
        logoutErrorMsg.style.display = 'block';
      }
    }

  } catch (error) {
    console.error('Logout error:', error);
    const logoutErrorMsg = document.getElementById('logoutErrorMsg');
    if (logoutErrorMsg) {
      logoutErrorMsg.textContent = 'An error occurred while logging out. Please try again.';
      logoutErrorMsg.style.display = 'block';
    }
  }
}


// Ensure CookieManager and tokenManager are defined or imported properly at the top

async function addScore() {
  console.log("[TEST] adding dummy score");

  // Check if CookieManager and tokenManager are available
  const userId = CookieManager.getCookie('userId');
  if (!userId) {
    console.error('No userId found in cookies');
    return;
  }
  
  // Ensure tokenManager.getAccessToken() is available
  const accessToken = tokenManager.getAccessToken();
  if (!accessToken) {
    console.error('No access token found');
    return;
  }
  
  // Send the POST request with the dummy score
  try {
    const response = await fetch(`/api/scores/add/`, {
      method: 'POST', // Use POST instead of GET when sending data
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user: userId, opponent: "ziliolu", user_score: 5, opponent_score: 4})
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
    } else {
      console.error('Failed to add score:', response.statusText);
    }
  } catch (error) {
    console.error('Error in fetch request:', error);
  }
}

async function loadGameHistory() {

  await addScore();  // Presumo que esta função seja para adicionar um novo score

  const data = await loadPersonalInfo();
  const scores = data.scores;

  // Limpa o conteúdo da tabela para evitar duplicação
  const tableBody = document.querySelector('#gameHistoryModal tbody');
  tableBody.innerHTML = '';

  // Itera sobre os scores e cria as linhas da tabela
  scores.forEach(score => {
      const date = new Date(score.date);
      const dateString = date.toISOString().split('T')[0];  // Formato YYYY-MM-DD
      const timeString = date.toTimeString().split(' ')[0];  // Formato HH:MM:SS
      const scoreString = `${score.user_score}-${score.opponent_score}`;
      const opponent = score.opponent;

      // Cria a linha da tabela (tr)
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${dateString}</td>
          <td>${timeString}</td>
          <td>${scoreString}</td>
          <td>@${opponent}</td>
      `;

      // Adiciona a linha na tabela
      tableBody.appendChild(row);
  });
}
