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
        const noFriendsRow = `<tr><td colspan="4" class="text-center text-muted"><small>Ops! You have no friends yet.</small></td></tr>`;
        tableBody.append(noFriendsRow);
      }
        const friendsModal = new bootstrap.Modal(document.getElementById('friendsListModal'));
        friendsModal.show();
    }

    async function loadGameHistory() {

    }

async function searchFriend(){
    const searchInput = document.getElementById('searchInput').value;

    const response = await fetch(`/api/users/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenManager.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });
}

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

  // Make onLogin globally accessible
window.loadFriendsList = loadFriendsList;
window.loadProfile = loadProfile;
window.loadEditProfile = loadEditProfile;
window.onEditFormSubmit = onEditFormSubmit;
window.excludeFriend = excludeFriend;
window.onLogout = onLogout;

async function onEditFormSubmit() {
   // Prevent the default form submission behavior
  try {
    // Extract updated values from the form
    const updatedData = {
      name: document.getElementById('editName').value,
      email: document.getElementById('editEmail').value,
      username: document.getElementById('editUsername').value.replace('@', ''), // Remove '@' for API compatibility
    };

    const userId = CookieManager.getCookie('userId');
      if (!userId) {
        console.error("User ID not found in cookies.");
        return;
      }

    // Handle the profile picture file if uploaded
    const profilePicInput = document.getElementById('editProfilePic');
    if (profilePicInput.files.length > 0) {
      const file = profilePicInput.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      // Optionally, append other fields to the FormData
      formData.append('name', updatedData.name);
      formData.append('email', updatedData.email);
      formData.append('username', updatedData.username);

      try {
      // Send a multipart request if updating the profile picture
        const response = await fetch(`/api/users/${userId}/`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${tokenManager.getAccessToken()}`, // Authorization token
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to update profile: ${response.statusText}`);
        }

        console.log('Profile updated successfully with picture!');
        loadPersonalInfo();
        return;
      } catch (error) {
        console.error('Error updating profile with picture:', error);
      }
    }

    try {
      const response = await fetch(`/api/users/${userId}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${tokenManager.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }

      console.log('Profile updated successfully!');
      
      loadPersonalInfo();
      const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
      editProfileModal.hide();
    } catch (error) {
      console.error('Error updating profile:', error);
    }

  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

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

  const userId = CookieManager.getCookie('userId');
  if (!userId) {
    return;
  }
  console.log(tokenManager.getAccessToken());
  const response = await fetch(`/api/authentication/sign-out`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
    }
  });
  if (response.ok) {
    data = await response.json();
  }
  tokenManager.clearTokens();
  loadContent("login");
  return data; 
}
