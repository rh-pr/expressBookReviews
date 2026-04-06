const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some(
        user => user.username === username && user.password === password
    );
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
   const { username, password } = req.body;

  if (!username || !password ) {
    return res.status(404).json({message: "Username and password are requeired!"});  
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { username: username },
      "access", // secret key (keep consistent in your app)
      { expiresIn: "1h" }
    );

      req.session.authorization = {
        accessToken,
        username
      };

    return res.status(200).json({
      message: "User successfully logged in",
      token: accessToken
    });
  } else {
    return res.status(403).json({ message: "Invalid login credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;

  // username is usually stored in session after login
  const username = req.session?.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }


  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
  
    // Get logged-in user
    const username = req.session?.authorization?.username;
  
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    // Check if book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if user has a review
    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "No review found for this user" });
    }
  
    // Delete the review
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully" });
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
