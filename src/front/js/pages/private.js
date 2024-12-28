import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import "../../styles/private.css"; 


const Private = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        if (!store.token) {
            navigate("/login");
        } else {
            actions.getUserData();
        }
    }, [store.token, navigate, actions]);

    return (
        <div className="private-container">
            <h1 className="profile-title">Your Profile</h1>
            {store.user ? (
                <div className="welcome-message">
                    <p>Welcome, <span className="user-name">{store.user.email}</span> to your private page!</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Private;
