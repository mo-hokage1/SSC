# SSC

![Image 1](https://res.cloudinary.com/dgiiiwpvi/image/upload/v1668432280/p0l8n6fodfhwueoqe8pj.png)  
 

SSC is a website where users can create and review products. In order to review or create a product, you must have an account.

This project was created using EJS, Node.js, Express, MongoDB, and Bootstrap. Passport.js was used to handle authentication.  

``````````````````````````````````````````````````````````````````````````````
Features
``````````````````````````````````````````````````````````````````````````````

Sort products by highest rating, most reviewed, lowest price, or highest price

Authentication:

User login with username and password

Admin sign-up with admin code

Authorization:

One cannot manage posts and view user profile without being authenticated

One cannot edit or delete posts and comments created by other users

Admin can manage all posts and comments

Manage products posts with basic functionalities:

Create, edit and delete posts and comments

Upload product photos

Search existing products

Sort products by highest rating, most reviewed, lowest price, or highest price

Manage user account with basic functionalities:

Profile page setup with sign-up

Flash messages responding to users' interaction with the app

Responsive web design

## Run it locally
1. Install [mongodb](https://www.mongodb.com/)
2. Create a cloudinary account to get an API key and secret code

```
git clone https://github.com/mo-hokage1/SSC.git
cd SSC
npm install
```

Create a .env file (or just export manually in the terminal) in the root of the project and add the following:  

```
DATABASEURL='<url>'
API_KEY=''<key>
API_SECRET='<secret>'
```

Run ```mongod``` in another terminal and ```node app.js``` in the terminal with the project.  

Then go to (http://localhost:3000/)


Url:-  sscreviews.herokuapp.com