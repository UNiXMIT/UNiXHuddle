document.addEventListener('DOMContentLoaded', function() {

    function getUsers() {
        fetch('/users')
        .then(response => response.json())
        .then(data => {
            const selectBox = document.getElementById('userName');
            data.forEach(row => {
                const option = document.createElement('option');
                option.value = row.userName;
                option.text = row.userName;
                selectBox.appendChild(option);
            });
            document.getElementById('date').value = toDateInputValue(new Date());
            getDataUser();
        })
        .catch(error => console.error('Error fetching names:', error));
    }

    function submitData(event) {
        event.preventDefault();
        const userName = document.getElementById('userName').value;
        const date = document.getElementById('date').value;
        const capacity = document.getElementById('capacity').value;
        const wellbeing = document.getElementById('wellbeing').value;
        const upskilling = document.getElementById('upskilling').value;
        const knowledgeTransfer = document.getElementById('knowledgeTransfer').value;
        const goal1 = document.getElementById('goal1').value;
        const goal2 = document.getElementById('goal2').value;
        const goal3 = document.getElementById('goal3').value;
        const goal4 = document.getElementById('goal4').value;
        const goal5 = document.getElementById('goal5').value;
        const data = JSON.stringify({ userName, date, capacity, wellbeing, upskilling, knowledgeTransfer, goal1, goal2, goal3, goal4, goal5 });
        sendData(data);
    }

    async function sendData(data) {
        await fetch('/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Headers": '*' },
            body: data
        })
        .then(response => {
            alert("Data has been saved.");
        })
        .catch((error) => {
            alert("There was a problem saving your data. Please try again.")
        });
    }

    async function getDataUser() {
        const userName = document.getElementById('userName').value;
        const date = document.getElementById('date').value;
        if (userName && date) {
            await fetch(`/load?userName=${userName}&date=${date}`)
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
            let capacityValue = parseFloat(document.getElementById('capacity').value);
            if (capacityValue > 3) {
                document.getElementById('capacity').style.color = 'red';
                document.getElementById('capacity').style.fontWeight = 'bold';
            } else {
                document.getElementById('capacity').style.color = 'black';
                document.getElementById('capacity').style.fontWeight = 'normal';
            }
            let wellbeingValue = parseFloat(document.getElementById('wellbeing').value);
            if (wellbeingValue < 31 && wellbeingValue > 0) {
                document.getElementById('wellbeing').style.color = 'red';
                document.getElementById('wellbeing').style.fontWeight = 'bold';
            } else {
                document.getElementById('wellbeing').style.color = 'black';
                document.getElementById('wellbeing').style.fontWeight = 'normal';
            }
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
        var select = document.getElementById('userName');
        select.selectedIndex++;
        if (!select.value) {
            resetForm();
        }
        getDataUser();
    }

    function selectPrevious() {
        var select = document.getElementById('userName');
        select.selectedIndex--;
        if (!select.value) {
            resetForm();
        }
        getDataUser();
    }

    function toDateInputValue(dateObject){
        const local = new Date(dateObject);
        local.setMinutes(dateObject.getMinutes() - dateObject.getTimezoneOffset());
        return local.toJSON().slice(0,10);
    }

    function assignKeys() {
        window.addEventListener('keydown', function(event) {
            if (event.code === 37 || event.key === "ArrowLeft") {
                selectPrevious();
            }
            if (event.code === 39 || event.key === "ArrowRight") {
                selectNext();
            }
        });
    }
    
    document.getElementById('userName').addEventListener('change', getDataUser);
    document.getElementById('date').addEventListener('change', getDataUser);
    document.getElementById('next').addEventListener('click', selectNext);
    document.getElementById('previous').addEventListener('click', selectPrevious);
    document.getElementById('submit').addEventListener('click', submitData); 
    assignKeys();
    getUsers();

});
