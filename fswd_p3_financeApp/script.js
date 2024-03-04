//this function shows a template pop up based on it index
function showPopup(i){
    let temp = document.getElementsByTagName("template")[i];
    console.log(temp);
    let clon = temp.content.cloneNode(true);
    document.body.appendChild(clon);
}

//this function hides a pop up based on its id
function hidePopup(tohide) {
    const popup = document.getElementById(tohide);
    popup.remove();
}
function handleLists(i) {
    const openIcon = document.querySelector('.open-icon');
    const closeIcon = document.querySelector('.close-icon');

    if (list.style.display === 'none' || list.style.display === '') {
        showPopup(i);
        openIcon.style.display = 'none';
        closeIcon.style.display = 'inline-block';
    } else {
        
        openIcon.style.display = 'inline-block';
        closeIcon.style.display = 'none';
    }
}
