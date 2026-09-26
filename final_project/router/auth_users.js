const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => user.username === username);
    return userswithsamename.length === 0;
}
regd_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!isValid(username)) {
        return res.status(409).json({
            message: "User already exists!"
        });
    }

    users.push({ username, password });

    return res.status(200).json({
        message: "User successfully registered. Now you can login"
    });
});
const authenticatedUser = (username, password) => {
    let validusers = users.filter(
        (user) => user.username === username && user.password === password
    );
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (authenticatedUser(username, password)) {
        return res.status(200).json({
            message: "Login successful"
        });
    }

    return res.status(401).json({
        message: "Invalid username or password"
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.body.username;
    const review = req.body.review;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!username || !review) {
        return res.status(400).json({
            message: "Username and review are required"
        });
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added successfully",
        reviews: books[isbn].reviews
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.body.username;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!username || !books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review not found"
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully"
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
