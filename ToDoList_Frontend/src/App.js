import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TodoApp from "./pages/TodoApp";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./pages/Dashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const App = () => {
  return (
    <>
    <Router>
      <Routes>
       
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todo" element={<TodoApp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        


      </Routes>
    </Router>
    <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default App;