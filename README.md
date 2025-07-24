## Overview

A modern, full-stack habit tracking app built with React, Express, and SQLite. This project lets users register, log in, create and manage personalized habit lists, and log their daily progress—all with persistent authentication and a polished UI.

## Features

- **User Registration & Login**
  - Secure registration and login with hashed passwords (bcryptjs)  
- **Personal Habit Dashboard**
  - Add, view, edit, or delete any number of habits  
  - Optionally tag habits with category and description  
- **Track Daily Progress**
  - Log Done or Missed for each habit by date  
  - Review, edit, or remove daily progress entries  
- **Modern Responsive UI**
  - Material UI with themes, gradients, and mobile-friendly design  
- **Data Security & Persistence**
  - User authentication and habits stored in SQLite  
  - Session persistence via localStorage  

## Screenshots

![Register / Log in](login_register.png)  
![Your Habit Dashboard](tracker.png)  

## Quick Start

### Prerequisites

- Node.js v16+ (brew install node on Mac)  
- npm (comes with Node)  

### Setup Instructions
```sh 
git clone https://github.com/sanjanakumar06/smart-habit-tracker.git
cd smart-habit-tracker

npm install
cd client
npm install
cd ..

npm run server

cd client
npm start
```

## Usage

1. Register (username and password – minimum 6 characters)  
2. Login with your credentials  
3. Add a Habit: Provide a name, optional category, and description  
4. View, Edit, or Delete Habits  
5. Log Progress:  
   - Mark as "Done" or "Missed" per day  
   - Edit or Delete Progress via dialog  
6. Log Out to clear your session (persistent in browser)  
