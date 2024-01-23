document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.list-knowledges');
    if (skills){
        skills.addEventListener('click', addSkills);
    }
});

const skills = new Set();

const addSkills = (e) => {
    if(e.target.tagName == 'LI'){
        if(e.target.classList.contains('active')){
            //Remove it from the set and remove the active class
            skills.delete(e.target.textContent);
            e.target.classList.remove('active');
        } else {
            //Add it to the set and add the class
            skills.add(e.target.textContent);
            e.target.classList.add('active');
        }
    }

    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}