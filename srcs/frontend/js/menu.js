async function loadMenu(){
    let data = await loadPersonalInfo();
    const profilePic = data.avatar ? data.avatar : getRandomAvatar();
    document.getElementById('profilePic').src = profilePic;
}

window.loadMenu = loadMenu;