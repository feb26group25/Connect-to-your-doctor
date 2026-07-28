import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";


export default function LogoutComp() {
    //dispatch action redux
    //navigate to/
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(logout())
        navigate("/")
    }, []);

}