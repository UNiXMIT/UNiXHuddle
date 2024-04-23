document.addEventListener('DOMContentLoaded', function() {

    function getTeams() {
        fetch('/teams')
        .then(response => response.json())
        .then(data => {
            const selectBox = document.getElementById('userTeam');
            data.forEach(data => {
                const option = document.createElement('option');
                option.value = data.userTeam;
                option.text = data.userTeamName;
                selectBox.appendChild(option);
            });
            getUsers();
        })
        .catch(error => console.error('Error fetching names:', error));
    }

    function getUsers() {
        const userTeam = document.querySelector('#userTeam').value;
        fetch(`/users?userTeam=${userTeam}`)
        .then(response => response.json())
        .then(data => {
            const selectBox = document.getElementById('userName');
            data.userNames.forEach(userName => {
                const option = document.createElement('option');
                option.value = userName;
                option.text = userName;
                selectBox.appendChild(option);
            });
            document.getElementById('date').value = toDateInputValue(new Date());
            getDataUser();
        })
        .catch(error => console.error('Error fetching names:', error));
        previousUserValue = document.querySelector('#userName').value;
        previousDateValue = document.querySelector('#date').value;
    }

    function submitData() {
        if (formChanged) {
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].disabled = true;
            }
            const userName = document.getElementById('userName').value;
            const date = document.getElementById('date').value;
            const userTeam = document.querySelector('#userTeam').value;
            const capacity = document.getElementById('capacity').value;
            const wellbeing = document.getElementById('wellbeing').value;
            const upskilling = document.getElementById('upskilling').value;
            const knowledgeTransfer = document.getElementById('knowledgeTransfer').value;
            const goal1 = document.getElementById('goal1').value;
            const goal2 = document.getElementById('goal2').value;
            const goal3 = document.getElementById('goal3').value;
            const goal4 = document.getElementById('goal4').value;
            const goal5 = document.getElementById('goal5').value;
            const data = JSON.stringify({ userName, date, userTeam, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5 });
            sendData(data);
            getDataUser();
        }
    }

    async function sendData(data) {
        await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Headers": '*' },
            body: data
        })
        .then(response => {
            if (response.status === 200) {
                let alertButton = document.querySelector('.submit');
                let discardButton = document.querySelector('.discard');
                alertButton.classList.add("disableHover");
                discardButton.classList.add("disableHover");
                alertButton.style.backgroundColor = '#3cb371';
                alertButton.style.borderColor =  '#3cb371';
                alertButton.value = 'Saved';
                setTimeout(function () {
                    alertButton.style = '';
                    alertButton.value = 'Submit';
                    alertButton.classList.remove("disableHover");
                    discardButton.classList.remove("disableHover");
                    onSavedChange();
                }, 2000);
            } else {
                let alertButton = document.querySelector('.submit');
                let discardButton = document.querySelector('.discard');
                alertButton.classList.add("disableHover");
                discardButton.classList.add("disableHover");
                alertButton.style.backgroundColor = '#f73333';
                alertButton.style.borderColor =  '#f73333';
                alertButton.value = 'ERROR!';
                (async ()=>{
                    await sleep(2000);
                    onSaveError();
                    alertButton.style.backgroundColor = '#ffc300';
                    alertButton.style.borderColor =  '#ffc300';
                    alertButton.value = 'Submit';
                    alertButton.classList.remove("disableHover");
                    discardButton.classList.remove("disableHover");
                })(); 
            }
        })
        .catch((error) => {
            let alertButton = document.querySelector('.submit');
            let discardButton = document.querySelector('.discard');
            alertButton.classList.add("disableHover");
            discardButton.classList.add("disableHover");
            alertButton.style.backgroundColor = '#f73333';
            alertButton.style.borderColor =  '#f73333';
            alertButton.value = 'ERROR!';
            (async ()=>{
                await sleep(2000);
                onSaveError();
                alertButton.style.backgroundColor = '#ffc300';
                alertButton.style.borderColor =  '#ffc300';
                alertButton.value = 'Submit';
                alertButton.classList.remove("disableHover");
                discardButton.classList.remove("disableHover");
            })();
        });
    }

    async function getDataUser() {
        const userName = document.getElementById('userName').value;
        const date = document.getElementById('date').value;
        const userTeam = document.querySelector('#userTeam').value;
        if (userName && date && userTeam) {
            await fetch(`/load?userName=${userName}&date=${date}&userTeam=${userTeam}`)
            .then(response => response.json())
            .then(data => {
                populateForm(data);
            })
            .catch(error => {
                resetForm();
            });
        }        
    }

    function populateForm(data) {
        if (data) {
            document.getElementById('capacity').value = data.capacity || '0';
            document.getElementById('wellbeing').value = data.wellbeing || '0';
            document.getElementById('upskilling').value = data.upskilling || '0';
            document.getElementById('knowledgeTransfer').value = data.knowledgeTransfer || '0';
            document.getElementById('goal1').value = data.goal1 || '';
            document.getElementById('goal2').value = data.goal2 || '';
            document.getElementById('goal3').value = data.goal3 || '';
            document.getElementById('goal4').value = data.goal4 || '';
            document.getElementById('goal5').value = data.goal5 || '';
            validateMetrics()
        } else {
            resetForm();
        }
    }
    
    function resetForm() {
        document.getElementById('capacity').value = '0';
        document.getElementById('wellbeing').value = '0';
        document.getElementById('upskilling').value = '0';
        document.getElementById('knowledgeTransfer').value = '0';
        document.getElementById('goal1').value = '';
        document.getElementById('goal2').value = '';
        document.getElementById('goal3').value = '';
        document.getElementById('goal4').value = '';
        document.getElementById('goal5').value = '';
        document.getElementById('capacity').style.color = 'black';
        document.getElementById('capacity').style.fontWeight = 'normal';
        document.getElementById('wellbeing').style.color = 'black';
        document.getElementById('wellbeing').style.fontWeight = 'normal';
    }

    function selectNext() {
        let select = document.getElementById('userName');
        if (!formChanged && select.selectedIndex < select.options.length - 1) {
            select.selectedIndex++;
            if (!select.value) {
                resetForm();
            }
            getDataUser();
            document.querySelector('#previous').style.visibility = 'visible';
        } 
        if (select.selectedIndex === select.options.length - 1) {
            document.querySelector('#next').style.visibility = 'hidden';
        }
    }

    function selectPrevious() {
        let select = document.getElementById('userName');
        if (!formChanged && select.selectedIndex > 0) {
            select.selectedIndex--;
            if (!select.value) {
                resetForm();
            }
            getDataUser();
            document.querySelector('#next').style.visibility = 'visible';
        }
        if (select.selectedIndex === 0) {
            document.querySelector('#previous').style.visibility = 'hidden';
        }
    }

    function toDateInputValue(dateObject){
        const local = new Date(dateObject);
        local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
        return local.toJSON().slice(0,10);
    }

    function onInputChange() {
        document.querySelector('#userTeam').disabled = true;
        document.querySelector('#userName').disabled = true;
        document.querySelector('#date').disabled = true;
        let alertButton = document.querySelector('.submit');
        alertButton.style.backgroundColor = '#ffc300';
        alertButton.style.borderColor =  '#ffc300';
        let discardButton = document.querySelector('.discard');
        discardButton.style.backgroundColor = '#f73333';
        discardButton.style.borderColor =  '#f73333';
        formChanged = true;
    }

    function onFocusChange() {
        validateMetrics();
    }

    function onSavedChange() {
        document.querySelector('#userTeam').disabled = false;
        document.querySelector('#userName').disabled = false;
        document.querySelector('#date').disabled = false;
        let alertButton = document.querySelector('.submit');
        alertButton.style = '';
        let discardButton = document.querySelector('.discard');
        discardButton.style = '';
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
        }
        validateMetrics();
        formChanged = false;
    }

    function onSaveError() {
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].disabled = false;
        }
        validateMetrics();
    }

    function validateMetrics() {
        let capacityValue = parseFloat(document.getElementById('capacity').value);
        if (capacityValue > 5) {
            document.getElementById('capacity').value = 5;
        }
        if (capacityValue < 0) {
            document.getElementById('capacity').value = 0;
        }
        if (isNaN(capacityValue)) {
            document.getElementById('capacity').value = 0;
        }
        if (capacityValue > 3) {  
            document.getElementById('capacity').style.color = '#f73333';
            document.getElementById('capacity').style.fontWeight = 'bold';          
        } else {
            document.getElementById('capacity').style.color = 'black';
            document.getElementById('capacity').style.fontWeight = 'normal';
        }
        let wellbeingValue = parseFloat(document.getElementById('wellbeing').value);
        if (wellbeingValue < 31 && wellbeingValue > 0) {
            document.getElementById('wellbeing').style.color = '#f73333';
            document.getElementById('wellbeing').style.fontWeight = 'bold';
        } else {
            document.getElementById('wellbeing').style.color = 'black';
            document.getElementById('wellbeing').style.fontWeight = 'normal';
        }
        if (wellbeingValue < 0) {
            document.getElementById('wellbeing').value = 0;
        }
        if (isNaN(wellbeingValue)) {
            document.getElementById('wellbeing').value = 0;
        }
        let upskillingValue = parseFloat(document.getElementById('upskilling').value);
        if (upskillingValue < 0) {
            document.getElementById('upskilling').value = 0;
        }
        if (isNaN(upskillingValue)) {
            document.getElementById('upskilling').value = 0;
        }
        let knowledgeValue = parseFloat(document.getElementById('knowledgeTransfer').value);
        if (knowledgeValue < 0) {
            document.getElementById('knowledgeTransfer').value = 0;
        }
        if (isNaN(knowledgeValue)) {
            document.getElementById('knowledgeTransfer').value = 0;
        }
    }

    function discardChanges() {
        if (formChanged) {
            getDataUser();
            onSavedChange();
        }
    }

    function assignKeys() {
        window.addEventListener('keydown', function(event) {
            if (document.activeElement.tagName !== 'INPUT' && !formChanged) {
                if (event.code === 37 || event.key === "ArrowLeft") {
                    selectPrevious();
                    event.preventDefault()
                }
                if (event.code === 39 || event.key === "ArrowRight") {
                    selectNext();
                    event.preventDefault()
                }
                // if (event.code === 38 ||event.key === "ArrowUp") {
                // }
                // if (event.code === 40 ||event.key === "ArrowDown") {
                // }
            }
        });
    }

    document.querySelector('#userTeam').addEventListener('change', function() {
        if (!formChanged) {
            document.querySelector('#userName').innerHTML = "";
            getUsers();
        }
    });

    document.querySelector('#userName').addEventListener('change', function() {
        if (!formChanged) {
            previousUserValue = document.querySelector('#userName').value;
            getDataUser();
        }
        let select = document.getElementById('userName');
        if (select.selectedIndex === select.options.length - 1) {
            document.querySelector('#next').style.visibility = 'hidden';
            document.querySelector('#previous').style.visibility = 'visible';
        } else if (select.selectedIndex === 0) {
            document.querySelector('#next').style.visibility = 'visible';
            document.querySelector('#previous').style.visibility = 'hidden';
        } else {
            document.querySelector('#next').style.visibility = 'visible';
            document.querySelector('#previous').style.visibility = 'visible';
        }
    });

    document.querySelector('#date').addEventListener('change', function() {
        if (!formChanged) {
            previousDateValue = document.querySelector('#date').value;
            getDataUser();
        }
    });

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };
    
    document.querySelector('#next').addEventListener('click', selectNext);
    document.querySelector('#previous').addEventListener('click', selectPrevious);
    document.querySelector('.submit').addEventListener('click', submitData); 
    document.querySelector('.discard').addEventListener('click', discardChanges); 
    document.querySelector('#previous').style.visibility = 'hidden';
    let previousUserValue = '';
    let previousDateValue = '';
    getTeams();
    assignKeys();
    let formChanged = false;
    let form = document.getElementById('metrics');
    let inputs = form.getElementsByTagName('input');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('input', onInputChange);
        inputs[i].addEventListener('blur', onFocusChange);
    }
    window.onbeforeunload = function() {
        if (formChanged) {
            return "You have unsaved changes. Are you sure you want to leave this page?";
        }
    };

});
