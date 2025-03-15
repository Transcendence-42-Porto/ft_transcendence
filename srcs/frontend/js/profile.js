import CookieManager from "./cookieManager.js";
import tokenManager from "./token.js";

    async function loadPersonalInfo() {
      let data = ""; 

      const userId = CookieManager.getCookie('userId');
      if (!userId) {
        return;
      }
      let response = await fetch(`/api/users/${userId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${await tokenManager.getAccessToken()}`,
            'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
       }
      if (response.ok) {
        data = await response.json();
      }
      return data; 
    }

    async function loadProfile() {
      const data = await loadPersonalInfo(); 
      if(data == "")
        loadContent('login');
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
        const data = await loadPersonalInfo();
        const profilePic = data.avatar || getRandomAvatar();
        const name = data.name || "";
        const username = data.username ? "@" + data.username : "";
        const email = data.email || "";
    
        document.getElementById('editProfilePic').src = profilePic;
        document.getElementById('editName').value = name;
        document.getElementById('editUsername').value = username;
        document.getElementById('editEmail').value = email;
      } catch (error) {
      }
    }

    async function loadFriendsList() {
      const data = await loadPersonalInfo();
      const tableBody = $('#friendsListModal tbody');
      let friends = 0;
      tableBody.empty();
    
      if (data && data.friends && data.friends.length > 0) {
        for (let friend of data.friends) {
          try {
            const friendResponse = await fetch(`/api/users/${friend.id}/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${await tokenManager.getAccessToken()}`,
              },
            });
    
            if (friendResponse.ok) {
              friends++;
              const friendData = await friendResponse.json();
              const avatar = friendData.avatar ? friendData.avatar : getRandomAvatar();
              const statusColor = friendData.isOnline ? 'green' : 'red';
              const truncatedEmail = friendData.email.length > 12 ? friendData.email.substring(0, 12) + '...' : friendData.email;
              const friendRow = `
                <tr>
                  <td><img src="${avatar}" class="rounded-circle img-fluid" width="50" /></td>
                  <td>${friendData.username}</td>
                   <td>
                      <span data-bs-toggle="tooltip" data-bs-placement="top" title="${friendData.email}" style="color: black !important">
                        ${truncatedEmail}
                      </span>
                  </td>
                  <td><span class="status-bullet" style="width: 10px; height: 10px; background-color: ${statusColor}; border-radius: 50%; display: inline-block;"></span></td>
                  <td><button class="btn btn-danger btn-sm" onclick="excludeFriend('${friendData.id}')">Exclude</button></td>
                </tr>
              `;
              tableBody.append(friendRow);
            }
          } catch (error) {
          }
        }
      }
    
      if (friends === 0) {
        const noFriendsRow = `<tr><td colspan="5" class="text-center text-muted modal-error-msg"><small>Ops! You have no friends yet.</small></td></tr>`;
        tableBody.append(noFriendsRow);
      }
    
      const friendsModal = new bootstrap.Modal(document.getElementById('friendsListModal'));
      friendsModal.show();
    }
    
    async function searchFriend() {
      try {
        const searchInput = document.getElementById('searchFriendInput').value;
        if (!searchInput) return;
    
        $('.modal-backdrop').remove();
    
        const users = await fetch(`/api/users/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${await tokenManager.getAccessToken()}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (users.ok) {
          let dataUsers = await users.json();
    
          const tableBody = $('#friendsListModal tbody');
          tableBody.empty();
    
          const personalData = await loadPersonalInfo();
    
          const matchingUser = dataUsers.find(user => user.username.toLowerCase().includes(searchInput.toLowerCase()));
          const currentUserId = CookieManager.getCookie('userId');
          const isAlreadyFriend = "";
          if(matchingUser)
            isAlreadyFriend = personalData.friends.some(friend => friend.id === matchingUser.id);
    
          if (matchingUser && matchingUser != undefined && matchingUser.id != currentUserId && !isAlreadyFriend && matchingUser.username != "admin") {
            const statusColor = matchingUser.isOnline ? 'green' : 'red';
            const truncatedEmail = matchingUser.email.length > 12 ? matchingUser.email.substring(0, 12) + '...' : matchingUser.email;
            const newRow = `
              <tr>
                <td><img src="${matchingUser.avatar}" class="rounded-circle img-fluid" width="50" /></td>
                <td>${matchingUser.username}</td>
                <td>
                  <span data-bs-toggle="tooltip" data-bs-placement="top" title="${matchingUser.email}" style="color: black !important">
                    ${truncatedEmail}
                  </span>
                </td>
                <td><span class="status-bullet" style="width: 10px; height: 10px; background-color: ${statusColor}; border-radius: 50%; display: inline-block;"></span></td>
                <td>
                  <button class="btn btn-success btn-sm" onclick="addFriend('${matchingUser.username}')">Add Friend</button>
                </td>
              </tr>
            `;
            tableBody.append(newRow);
          } else {
            const noResultRow = `<tr><td colspan="5" class="text-center text-muted modal-error-msg"><small>No user found with that username.</small></td></tr>`;
            tableBody.append(noResultRow);
          }
    
        }
    
        $('#friendsListModal').modal('show');
    
      } catch (error) {
      }
    }    
    

async function addFriend(friendUsername) {

  try {
    const response = await fetch(`/api/users/add-friends`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${await tokenManager.getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: friendUsername})
    });

    if(response.ok){
      const data = response.json();
      loadFriendsList();
    }
  }
  catch (error)
  { 
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
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImage() {
  const fileInput = document.getElementById('editProfilePic');
  const file = fileInput.files[0]; 

  if (!file) {
    return;
  }

  try {
    const base64Image = await convertToBase64(file);
    const formData = new FormData();
    formData.append('image', base64Image);

    const response = await fetch('https://api.imgbb.com/1/upload?expiration=600&key=7f1ce90d4a2253cde69249da170d67f7', {
      method: 'POST', 
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      const imageUrl = data.data.url;
      return imageUrl;
    } else {
      return null;
    }
  } catch (error) {
  }
}

async function onEditFormSubmit() {
  try {
    let newName = document.getElementById('editName').value;
    let newEmail = document.getElementById('editEmail').value;
    let newUsername = document.getElementById('editUsername').value.replace('@', '');
    let newAvatarFile = await uploadImage();

    const userId = CookieManager.getCookie('userId');
    if (!userId) {
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
          Authorization: `Bearer ${await tokenManager.getAccessToken()}`,
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
      document.body.removeAttribute('aria-hidden');
      return;

    } catch (error) {
      $('#editProfileErrorMsg').html("Ops! There was a problem updating the profile. Try it again later!");
    }
  } catch (error) {
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
    return;
  }

  const data = await loadPersonalInfo();
  const friendId = Number(id);

  const friend = data.friends.find(friend => friend.id === friendId);
  if (!friend) {
    return;
  }

  const response = await fetch(`/api/users/remove-friends`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await tokenManager.getAccessToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: friend.username})
  });

  if (response.ok) {
    loadFriendsList();
  } else {
  }
}

async function onLogout() {
  const logoutErrorMsg = document.getElementById('logoutErrorMsg');
  logoutErrorMsg.textContent = '';
  logoutErrorMsg.style.display = 'block';

  try {
    const userId = CookieManager.getCookie('userId');
    if (!userId) {
      return;
    }

    const response = await fetch(`/api/authentication/sign-out`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await tokenManager.getAccessToken()}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      const logoutModalElement = document.getElementById('logoutModal');
      const logoutModal = bootstrap.Modal.getInstance(logoutModalElement);
      if (logoutModal) {
        logoutModal.hide();
      }

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }

      loadContent("login");
    } else {
      const logoutErrorMsg = document.getElementById('logoutErrorMsg');
      if (logoutErrorMsg) {
        logoutErrorMsg.textContent = 'An error occurred while logging out. Please try again.';
        logoutErrorMsg.style.display = 'block';
      }
    }

  } catch (error) {
    const logoutErrorMsg = document.getElementById('logoutErrorMsg');
    if (logoutErrorMsg) {
      logoutErrorMsg.textContent = 'An error occurred while logging out. Please try again.';
      logoutErrorMsg.style.display = 'block';
    }
  }
}

async function loadGameHistory() {
  try {
    const data = await loadPersonalInfo();
    
    if (!data || !Array.isArray(data.scores)) {
      return;
    }

    const scores = data.scores;

    const tableBody = document.querySelector('#gameHistoryModal tbody');
    tableBody.innerHTML = '';

    if (scores.length === 0) {
      return;
    }

    scores.forEach(score => {
      const date = new Date(score.date);
      const dateString = date.toISOString().split('T')[0];
      const timeString = date.toTimeString().split(' ')[0];
      const gameType = score.game_type;
      const tournamentName = score.tournament_name;
      const scoreString = `${score.user_score}-${score.opponent_score}`;
      const opponent = score.opponent;

      const row = document.createElement('tr');
      if (gameType === "TOURNAMENT") {
        row.innerHTML = `
          <td>${dateString}</td>
          <td>${timeString}</td>
          <td>${gameType} ${tournamentName}</td>
          <td>${scoreString}</td>
          <td>@${opponent}</td>
        `;
      } else {
        row.innerHTML = `
          <td>${dateString}</td>
          <td>${timeString}</td>
          <td>${gameType}</td>
          <td>${scoreString}</td>
          <td>@${opponent}</td>
        `;
      }
      tableBody.appendChild(row);
    });

  } catch (error) {
  }
}
