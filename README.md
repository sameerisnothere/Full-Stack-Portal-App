# Student-Admin-Teacher Portal

A full-stack microservices-based portal designed for educational management. This project leverages a **React** frontend, a **Node.js** API Gateway, and multiple **Django** microservices for core logic.

nodejs version used: v22.20.0

## 🏗️ Architecture Overview

* **Frontend:** React (Vite)
* **API Gateway:** Node.js (v22.20.0)
* **Backend Services:** Django (Auth, Create, Read, Update, Delete)
* **Database:** MySQL / Relational (managed via Django & Node)
* **Security:** JWT, Bcrypt, PGP Encryption, Throttling, and Access Control.

> [!IMPORTANT]
> **Legacy Services Warning:** The folders under `backend/authentication-service`, `backend/create-service`, etc., are deprecated. **Always use the services located in the `djangoBackend/` directory.**

## 🔒 Security & Auth Features

* **Token-Based Auth:** JWT-based authentication with Bcrypt password hashing.
* **Session Management:** Active tokens are stored in the database.
* **Auto-Logout:** 1-hour session limit; tokens are automatically cleared from the DB and frontend `sessionStorage` upon expiration.
* **Access Control:** Protected routes on the frontend ensure users only access their designated portal (Student, Teacher, or Admin).
* **System Integrity:** Implemented throttling, logging, and granular authorization.

---

## 👥 User Roles & Features

### Common Features
* Role-based Dashboards.
* Personalized Profile Management.

### 🎓 Student
* Course enrollment (Max limit: 15 credit hours).
* Course unenrollment.

### 👨‍🏫 Teacher
* View assigned courses.
* View student rosters per course.

### 🔑 Admin
* Full CRUD on Students, Teachers, and Courses.
* Soft-delete functionality for all entities.


---

## 🚀 Getting Started

### 1. Environment Configuration

Create `.env` files in the following locations:

**Node.js API Gateway (`backend/api-gateway/.env`):**
```env
PORT=4000
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=rapidproject
CREATE_URL=[http://127.0.0.1:4001](http://127.0.0.1:4001)
READ_URL=[http://127.0.0.1:4002](http://127.0.0.1:4002)
UPDATE_URL=[http://127.0.0.1:4004](http://127.0.0.1:4004)
DELETE_URL=[http://127.0.0.1:4003](http://127.0.0.1:4003)
AUTH_URL=[http://127.0.0.1:4005](http://127.0.0.1:4005)
PGP_PASSPHRASE=very_secret_passphrase
```


**Django Services (`djangoBackend/auth-service/.env`, `djangoBackend/create-service/.env`, `djangoBackend/read-service/.env`, 
`djangoBackend/update-service/.env`, `djangoBackend/delete-service/.env`):**
```env
DB_HOSTNAME=127.0.0.1
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=rapidproject
DB_PORT=3306
```

### 2. Environment Configuration
**`backend/api-gateway/utils`**
node generatePgpKeys.js

copy the server_public.asc and paste it in the public folder of react (frontend/public)

**`backend/api-gateway`**
npm i
nodemon index.js

**`djangoBackend/auth-service`**
py -m venv venv
venv/Scripts/activate
install the dependancies until your pip list looks like this:
```
Package             Version
------------------- -------
asgiref             3.11.0
bcrypt              5.0.0
cffi                2.0.0
cryptography        46.0.3
Django              4.2
django-cors-headers 4.9.0
djangorestframework 3.16.1
jwt                 1.4.0
pip                 25.2
pycparser           2.23
PyJWT               2.10.1
PyMySQL             1.1.2
python-dotenv       1.2.1
sqlparse            0.5.3
tzdata              2025.2
py manage.py runserver 4005
```

**djangoBackend/create-service**
py -m venv venv
venv/Scripts/activate
install the dependancies until your pip list looks like this:
Package             Version
------------------- ----------
anyio               4.11.0
asgiref             3.11.0
bcrypt              5.0.0
certifi             2025.11.12
cffi                2.0.0
cryptography        46.0.3
Django              4.2
djangorestframework 3.16.1
h11                 0.16.0
httpcore            1.0.9
httpx               0.28.1
idna                3.11
pip                 25.2
pycparser           2.23
PyMySQL             1.1.2
python-dotenv       1.2.1
sniffio             1.3.1
sqlparse            0.5.3
tzdata              2025.2
py manage.py runserver 4001

-> djangoBackend/read-service
py -m venv venv
venv/Scripts/activate
install the dependancies until your pip list looks like this:
Package             Version
------------------- -------
asgiref             3.11.0
Django              4.2
djangorestframework 3.16.1
pip                 25.2
PyMySQL             1.1.2
python-dotenv       1.2.1
sqlparse            0.5.3
tzdata              2025.2
py manage.py runserver 4002

-> djangoBackend/update-service
py -m venv venv
venv/Scripts/activate
install the dependancies until your pip list looks like this:
Package             Version
------------------- ----------
anyio               4.12.0
asgiref             3.11.0
bcrypt              5.0.0
certifi             2025.11.12
Django              4.2
djangorestframework 3.16.1
h11                 0.16.0
httpcore            1.0.9
httpx               0.28.1
idna                3.11
pip                 25.2
PyMySQL             1.1.2
python-dotenv       1.2.1
sqlparse            0.5.4
tzdata              2025.2
py manage.py runserver 4004

-> djangoBackend/delete-service
py -m venv venv
venv/Scripts/activate
install the dependancies until your pip list looks like this:
Package             Version
------------------- ----------
anyio               4.11.0
asgiref             3.11.0
certifi             2025.11.12
Django              4.2
djangorestframework 3.16.1
h11                 0.16.0
httpcore            1.0.9
httpx               0.28.1
idna                3.11
pip                 25.2
PyMySQL             1.1.2
python-dotenv       1.2.1
sniffio             1.3.1
sqlparse            0.5.3
tzdata              2025.2
py manage.py runserver 4003

-> frontend
npm i
npm run dev

