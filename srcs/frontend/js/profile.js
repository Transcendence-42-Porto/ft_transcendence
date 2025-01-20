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
  
    //   $.ajax({
        
    //     url: `/api/users/${userId}/friends`, // Endereço da sua API
    //     method: 'GET',
    //     headers: {
    //       'Authorization': `Bearer ${tokenManager.getAccessToken()}`, // Token de autorização, se necessário
    //     },
    //     success: function(response) {
    //       // Limpar a tabela antes de preencher com novos dados
    //       const tableBody = $('#friendsListModal tbody');
    //       tableBody.empty();
  
    //       // Verificar se a resposta contém dados de amigos
    //       if (response && response.friends) {
    //         response.friends.forEach(friend => {
    //           // Criar uma linha para cada amigo
    //           const friendRow = `
    //             <tr>
    //               <td><img src="${friend.profilePicture}" class="rounded-circle img-fluid" width="50" /></td>
    //               <td>${friend.name}</td>
    //               <td>${friend.username}</td>
    //               <td><button class="btn btn-danger btn-sm">Exclude</button></td>
    //             </tr>
    //           `;
    //           // Adicionar a linha à tabela
    //           tableBody.append(friendRow);
    //         });
    //       } else {
    //         console.log("No friends found.");
    //       }
    //     },
    //     error: function(error) {
    //       console.error("Error fetching friends list:", error);
    //     }
    //   });
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
      data.friends.forEach(friend => {
        const friendRow = `
          <tr>
            <td><img src="${friend.profilePicture}" class="rounded-circle img-fluid" width="50" /></td>
            <td>${friend.name}</td>
            <td>${friend.username}</td>
            <td><button class="btn btn-danger btn-sm">Exclude</button></td>
          </tr>
        `;
        tableBody.append(friendRow);
      });

      const friendsModal = new bootstrap.Modal(document.getElementById('friendsListModal'));
      friendsrModal.show();
    } else {
      console.log("No friends found.");
    }
  } else {
    console.error("Error fetching friends list:", response.statusText);
  }
}

  
  // Make onLogin globally accessible
window.loadFriendsList = loadFriendsList;