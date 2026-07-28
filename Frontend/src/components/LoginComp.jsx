import { useReducer, useState } from "react"
import { useDispatch } from "react-redux"
import { loginSuccess } from "../redux/authSlice"
import { useNavigate } from "react-router-dom"

export default function LoginComp() {
    const [username, setusername] = useState("")
    const [password, setpassword] = useState("")
    const [message, setMessage] = useState("")
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handlesubmit = (e) => {
        e.preventDefault();
        const reqoptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password })
        };
        fetch("http://localhost:3000/login",reqoptions)
        .then(resp => {
            if(resp.status === 200){
                setMessage("Successful")
                return resp.json();
            }
            else if(resp.status === 404)
                setMessage("Invalid Username or Password")
                return {}
        })
        // .then(resp => resp.json())
        .then(data => {
            console.log(JSON.stringify(data));
            //redux state modify
            dispatch(loginSuccess({user: data.user , token: data.token}))
            if(data.user.role === 1){ //admin
                //navigate admin dashboard
                navigate("/admin");
            }
            else if(data.user.role === 2){ //user
                //navigate to user dashboard
                navigate("/user");
            }


            // if (data.success){
            //     setMessage("Incorrect password or username")
            // }
            // else{
            //     setMessage("sucessful");
            //     console.log("Response:", data);
            // }
        })
        .catch(err =>{ 
            setMessage("Incorrect password or username")
            console.error("Error:", err)
        });
    };
    return (
        <>
            <h1>Login Form </h1>
            <form>
                Enter username :
                <input type="text" name="username" value={username} onChange={(e)=>{setusername(e.target.value)}} />
                <br />
                Enter password :
                <input type="password" name = "password" value={password} onChange={(e)=>{setpassword(e.target.value)}} />
                <br />
                <input type="submit" value="Login" onClick={handlesubmit}/>
            </form>

            {message && <p>{message}</p>}

            <p> {username} </p>
            <p> {password} </p>
        </>
    )
}
