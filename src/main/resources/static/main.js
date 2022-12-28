const requestUrlPrefix = 'http://localhost:8080/api';

if (!document.querySelector('.messages')) {
    const container = document.createElement('div');
    container.classList.add('messages');
    container.style.cssText = 'position: fixed; top: 80%; left: 80; right: 0; max-width: 240px; margin: 0 auto;';
    document.body.appendChild(container);
}
const messages = document.querySelector('.messages');


function sendRequest(method, url, body = null) {
    const options = {
        method: method, body: JSON.stringify(body), headers: {
            'Content-Type': 'application/json'
        }
    };

    return fetch(requestUrlPrefix + url, method === 'GET' ? null : options).then(response => {
        if (!response.ok) {
            response.status === 409 ? showAlert('Data not saved!\nUser with this email already exists in the database!') :
                showAlert('Something went wrong')
            throw new Error('Server response: ' + response.status);
        }
        return response.json();
    });
}

function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible role="alert" fade show';
    alert.innerHTML = `<div class="fs-5">${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    messages.appendChild(alert);
}


async function getUsersTable() {
    let page = await fetch(requestUrlPrefix + "/admin")

    if (page.ok) {
        let listOfUsers = await page.json();
        loadTableData(listOfUsers)
    } else {
        alert(`Error, ${page.status}`);
    }
}

function loadTableData(listOfUsers) {
    const tableBody = document.querySelector('#usersListTableBody');
    let dataHtml = '';

    for (let user of listOfUsers) {
        let roles = [];

        for (let role of user.roles) {
            roles.push(" " + role.name.toString().replaceAll('ROLE_', ''))
        }
        dataHtml += `<tr>
            <td>${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.age}</td>
            <td>${user.username}</td>
            <td>${roles}</td>
            <td>
                <button type="button" class="btn btn-secondary" data-bs-toggle="modal"
                data-bs-target="#editModal" data-bs-userId="${user.id}">
                Edit
                </button>
            </td>
            <td>
                <button type="button" class="btn btn-danger" data-bs-toggle="modal"
                data-bs-target="#deleteModal" data-bs-userId="${user.id}">
                Delete
                </button>
            </td>
            </tr>`
    }
    tableBody.innerHTML = dataHtml;
}

getUsersTable().then(() => {});


async function getUserPage() {
    let page = await fetch(requestUrlPrefix + '/user');

    if (page.ok) {
        let user = await page.json();
        getInformationAboutUser(user);
    } else {
        alert(`Error, ${page.status}`);
    }
}

function getInformationAboutUser(user) {
    const userInfoTableBody = document.querySelector('#userInfoTable');
    let roles = []

    for (let role of user.roles) {
        roles.push(" " + role.name.toString().replaceAll('ROLE_', ''))
    }

    let tr = `<tr>
            <td id="current-user-id" value="${user.id}">${user.id}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.age}</td>
            <td>${user.username}</td>
            <td>${roles}</td>
        </tr>`
    userInfoTableBody.innerHTML = tr;
}

getUserPage().then(() => {});


const form_new = document.querySelector('#createUserForm');

function newUser() {
    form_new.addEventListener('submit', addNewUser)

    function addNewUser(e) {
        e.preventDefault();
        let newUserRoles = [];
        if (document.getElementById('new-role-admin').selected) newUserRoles.push({id: 1, name: 'ROLE_ADMIN'});
        if (document.getElementById('new-role-user').selected) newUserRoles.push({id: 2, name: 'ROLE_USER'});

        const user = {
            firstName: form_new.firstName.value,
            lastName: form_new.lastName.value,
            age: form_new.age.value,
            email: form_new.email.value,
            password: form_new.password.value,
            roles: newUserRoles
        };
        document.getElementById('new-firstName').value = '';
        document.getElementById('new-lastName').value = '';
        document.getElementById('new-age').value = '';
        document.getElementById('new-email').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('new-role-user').selected = true;
        document.getElementById('new-role-admin').selected = false;
        sendRequest('POST', '/admin', user).then(() => {
            form_new.reset();
            getUsersTable().then(() => {});
            document.querySelector('#nav-tab a[href="#nav-user-table"]').click();
        });
    }
}


const renderEditModalFormContent = (user) => {
    document.getElementById('editForm').innerHTML = `
        <label class="d-block mx-auto mt-2 mb-0 text-center fs-5 fw-bold">ID
            <input id="edit-id" name="id" type="text" value="${user.id}"
                   disabled
                   class="form-control mx-auto"
                   style="max-width: 250px;"></label>
        <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold"
               for="firstName">First
            name
            <input id="edit-firstName" name="firstName" value="${user.firstName}"
                   type="text"
                   class="form-control mx-auto"
                   style="max-width: 250px;"></label>
        <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Last
            name
            <input id="edit-lastName" name="lastName" value="${user.lastName}"
                   type="text"
                   class="form-control mx-auto"
                   style="max-width: 250px;"></label>
        <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Age
            <input id="edit-age" name="age" value="${user.age}" type="number"
                   class="form-control mx-auto"
                   style="max-width: 250px;"></label>
        <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Email
            <input id="edit-email" name="email" value="${user.email}" type="text"
                   class="form-control mx-auto"
                   style="max-width: 250px;"></label>
        <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Password
            <input id="edit-password" name="password" value="" type="password"
                   placeholder="Enter new password"
                   class="form-control mx-auto"
                   style="max-width: 250px;"></label>
        <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Role
            <select name="roles" class="form-select d-block mx-auto"
                    style="max-width: 250px;" size="2"
                    multiple>
                <option id="edit-role-admin" name="roles" value="1">ADMIN</option>
                <option id="edit-role-user" name="roles" value="2">USER</option>
            </select></label>
    `;
    user.roles.forEach(role => {
        if (role.id === 1) document.getElementById('edit-role-admin').selected = true;
        if (role.id === 2) document.getElementById('edit-role-user').selected = true;
    });
}

document.getElementById('editModal').addEventListener('show.bs.modal', (event) => {
    const userId = event.relatedTarget.getAttribute('data-bs-userId');
    sendRequest('GET', '/admin/' + userId).then(user => renderEditModalFormContent(user));
})

document.getElementById('editForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const userRolesEdited = [];
    if (document.getElementById('edit-role-admin').selected) userRolesEdited.push({id: 1, name: 'ROLE_ADMIN'});
    if (document.getElementById('edit-role-user').selected) userRolesEdited.push({id: 2, name: 'ROLE_USER'});
    const userEdited = {
        id: document.getElementById('edit-id').value,
        firstName: document.getElementById('edit-firstName').value,
        lastName: document.getElementById('edit-lastName').value,
        age: document.getElementById('edit-age').value,
        email: document.getElementById('edit-email').value,
        password: document.getElementById('edit-password').value,
        roles: userRolesEdited
    };
    sendRequest('PUT', '/admin', userEdited).then(() => {
        getUsersTable().then(() => {});
        getUserPage().then(() => {});
    });
    document.getElementById('buttonCloseModal').click();
});


const renderDeleteModalFormContent = (user) => {
    document.getElementById('deleteModalContent').innerHTML = `
            <label class="d-block mx-auto mt-2 mb-0 text-center fs-5 fw-bold">ID</label>
            <input id="delete-id" type="text" value="${user.id}" disabled class="form-control mx-auto" style="width: 250px;">
            <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">First name</label>
            <input id="delete-firstName" value="${user.firstName}" disabled type="text" class="form-control mx-auto" style="width: 250px;">
            <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Last name</label>
            <input id="delete-lastName" value="${user.lastName}" disabled type="text" class="form-control mx-auto" style="width: 250px;">
            <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Age</label>
            <input id="delete-age" value="${user.age}" disabled type="number" class="form-control mx-auto" style="width: 250px;">
            <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Email</label>
            <input id="delete-email" value="${user.email}" disabled type="text" class="form-control mx-auto" style="width: 250px;">
            <label class="form-label d-block mx-auto mt-3 mb-0 text-center fs-5 fw-bold">Role
            <select name="roles" disabled class="form-select d-block mx-auto"
                    style="max-width: 250px;" size="2"
                    multiple>
                <option id="delete-role-admin" name="roles" value="1">ADMIN</option>
                <option id="delete-role-user" name="roles" value="2">USER</option>
            </select></label>
    `;
    user.roles.forEach(role => {
        if (role.id === 1) document.getElementById('delete-role-admin').selected = true;
        if (role.id === 2) document.getElementById('delete-role-user').selected = true;
    });
}

document.getElementById('deleteModal').addEventListener('show.bs.modal', (event) => {
    const userId = event.relatedTarget.getAttribute('data-bs-userId');
    sendRequest('GET', '/admin/' + userId).then(user => renderDeleteModalFormContent(user));
})

document.getElementById('deleteForm').addEventListener('submit', (event) => {
    event.preventDefault();
    sendRequest('DELETE', '/admin/' + document.getElementById('delete-id').value).then(() => {
        getUsersTable().then(() => {});
    });
    document.getElementById('buttonCloseModal').click();
});