import axios from "axios";
import Swal from "sweetalert2";

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.list-knowledges');

    //Clean the alerts
    let alerts = document.querySelector('.alerts');

    if(alerts) {
        cleanAlerts();
    }


    if (skills){
        skills.addEventListener('click', addSkills);

        //Once we are on edit, call the function
        selectedSkills();
    }

    const vacanciesListing = document.querySelector('.deletebtn');
    
    if(vacanciesListing){
        vacanciesListing.addEventListener('click', actionsListing);
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

const selectedSkills = () => {
    const selected = Array.from(document.querySelectorAll('.list-knowledges .active'));

    selected.forEach(selection => {
        skills.add(selection.textContent);
    })
    //Put it on the hidden
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;

}

const cleanAlerts = () => {
    const alerts = document.querySelector('.alerts');
    const interval = setInterval(() => {
        if(alerts.children.length > 0){
            alerts.removeChild(alerts.children[0]);
        }else if (alerts.children.length === 0){
            alerts.parentElement.removeChild(alerts);
            clearInterval(interval);
        }
    }, 4000);

}

// Delete vacancies

const actionsListing = e => {
    e.preventDefault();
    if(e.target.dataset.delete){
        Swal.fire({
            title: "Confirm deletion?",
            text: "Once deleted, you can't recover it",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: 'No, cancel'
          }).then((result) => {
            if (result.isConfirmed) {
                //Delete through Axios
                const id = e.target.dataset.delete;
                const url = `${location.origin}/vacancies/delete/${id}`;

                axios.delete(url, {params: {id} })
                    .then(function(response){
                        if(response.status === 200){
                            Swal.fire({
                                title: "Deleted",
                                text: response.data,
                                icon: "success"
                            });

                            //Delete it from the DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            title: 'An error occurred',
                            text: 'It could not be deleted',
                            icon:'error'
                        })
                    });
                

            }
          });
    }else{
        window.location.href = e.target.href;
    }
}