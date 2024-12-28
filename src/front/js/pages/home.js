import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

import "../../styles/home.css";

export const Home = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    const handleLogout = () => {
        actions.logout();
        navigate("/");
    };

    const isLoggedIn = !!localStorage.getItem("token");

    return (
        <div className="home-container d-flex flex-column justify-content-center align-items-center vh-100">
            <div>
                <h1 className="title text-dark">
                    {isLoggedIn ? "Welcome to your page!" : "Welcome, please register!"}
                </h1>
            </div>
            <div className="mt-5">
                {isLoggedIn ? (
                    <div>
                        <Link to="/private">
                            <button className="btn btn-outline-dark me-3">Go to my profile</button>
                        </Link>
                        <button onClick={handleLogout} className="btn btn-outline-danger me-3">Logout</button>
                    </div>
                ) : (
                    <Link to="/register">
                        <button className="btn btn-primary mx-5">Register</button>
                    </Link>
                )}
            </div>
        </div>
    );
};
