import CookieManager from "./cookieManager.js";
import tokenManager from "./token.js";
    // Função para carregar a lista de amigos
    async function loadFriendsList() {
      // Recuperar o ID do usuário armazenado no cookie
      const userId = CookieManager.getCookie('userId');
      console.log(tokenManager.getAccessToken());
      if (!userId) {
        console.error("User ID not found in cookies.");
        return;
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

  const response = await fetch(`/api/users/${userId}/`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
    }
  });
  console.log(tokenManager.getAccessToken());
  if (response.ok) {
    const data = await response.json();
    const tableBody = $('#friendsListModal tbody');
    tableBody.empty();

    if (data && data.friends) {
      data.friends.forEach(async friendId => {
        const friendResponse = await fetch(`/api/users/${friendId}/`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${tokenManager.getAccessToken()}`,
          }
        });
        if (friendResponse.ok){
            const friend = await friendResponse.json();
            const friendRow = `
              <tr>
                <td><img src="${friend.avatar}" class="rounded-circle img-fluid" width="50" /></td>
                <td>${friend.username}</td>
                <td>${friend.email}</td>
                <td><button class="btn btn-danger btn-sm">Exclude</button></td>
              </tr>
            `;
            tableBody.append(friendRow);
        }
      });

      const friendsModal = new bootstrap.Modal(document.getElementById('friendsListModal'));
      friendsModal.show();
    } else {
      console.log("No friends found.");
    }
  } else {
    console.error("Error fetching friends list:", response.statusText);
  }
}

  
  // Make onLogin globally accessible
window.loadFriendsList = loadFriendsList;