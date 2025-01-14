import CookieManager from "./cookieManager.js";
import tokenManager from "./token.js";
    // Função para carregar a lista de amigos
    function loadFriendsList() {
      // Recuperar o ID do usuário armazenado no cookie
      const userId = CookieManager.getCookie('userId');
  
      if (!userId) {
        console.error("User ID not found in cookies.");
        return;
      }
  
      $.ajax({
        url: `/api/users/${userId}/friends`, // Endereço da sua API
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenManager.getAccessToken()}`, // Token de autorização, se necessário
        },
        success: function(response) {
          // Limpar a tabela antes de preencher com novos dados
          const tableBody = $('#friendsListModal tbody');
          tableBody.empty();
  
          // Verificar se a resposta contém dados de amigos
          if (response && response.friends) {
            response.friends.forEach(friend => {
              // Criar uma linha para cada amigo
              const friendRow = `
                <tr>
                  <td><img src="${friend.profilePicture}" class="rounded-circle img-fluid" width="50" /></td>
                  <td>${friend.name}</td>
                  <td>${friend.username}</td>
                  <td><button class="btn btn-danger btn-sm">Exclude</button></td>
                </tr>
              `;
              // Adicionar a linha à tabela
              tableBody.append(friendRow);
            });
          } else {
            console.log("No friends found.");
          }
        },
        error: function(error) {
          console.error("Error fetching friends list:", error);
        }
      });
    }
  
  // Make onLogin globally accessible
window.loadFriendsList = loadFriendsList;