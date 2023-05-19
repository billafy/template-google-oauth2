import { useState, useEffect } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

function App() {
    const [accessToken, setAccessToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isRefreshed, setIsRefreshed] = useState(false);

    const getUserProfile = async () => {
        try {
            const response = await axios.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setUserProfile(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    const googleLogin = useGoogleLogin({
        flow: "auth-code",
        onSuccess: async (codeResponse) => {
            const response = await axios.post(
                "http://localhost:5000/auth/login",
                { code: codeResponse.code },
                { withCredentials: true }
            );
            setAccessToken(response.data.tokens.access_token);
        },
        onError: (errorResponse) => console.log(errorResponse),
    });

    const googleLogout = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/auth/logout",
                { withCredentials: true }
            );
            window.location.reload()
        } catch (err) {
            console.log(err);
        }
    };

    const refresh = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/auth/refresh",
                { withCredentials: true }
            );
            if(response.data.success) 
                setAccessToken(response.data.tokens.access_token);
        } catch (err) {
            console.log(err);
        }
        setIsRefreshed(true);
    };

    useEffect(() => {
        if (accessToken) getUserProfile();
    }, [accessToken]);

    useEffect(() => {
        refresh();
    }, []);

    if(isRefreshed && !accessToken) 
        return (
            <div className="App">
                <div className="login-button">
                    {isRefreshed && !accessToken && (
                        <button onClick={googleLogin}>Sign In</button>
                    )}
                </div>
            </div>
        );
    return (
        <div className="App">
            {userProfile &&
                <div className="user-profile">
                    <h1>{userProfile.name}</h1>
                    <p>{userProfile.email}</p>
                    <img
                        src={userProfile.picture}
                        alt="Profile"
                        style={{ borderRadius: "50%" }}
                    />
                </div>}
            <button onClick={googleLogout}>Logout</button>
        </div>
    );
}

export default App;
