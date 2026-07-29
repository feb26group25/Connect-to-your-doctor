# ConnectDoc — User Authentication Service (Service 1)

Matches `USERS` and `ROLES` tables from your ER diagram. Runs on port **8081**.

## 1. Setup

1. Import as a Maven project into Eclipse / IntelliJ / STS.
2. Open `src/main/resources/application.properties` and set:
   - `spring.datasource.password` → your MySQL root password
   - Confirm `spring.datasource.url` points to your actual database name (currently `connectdoc`)
3. Your `roles` table must already have rows, e.g.:
   ```sql
   INSERT INTO roles (role_name) VALUES ('Patient'), ('Doctor'), ('Admin');
   ```
   Registration will fail with a 400 if the `roleName` sent from the frontend doesn't match a row here exactly.
4. Run `UserServiceApplication.java` (or `mvn spring-boot:run`).
5. Confirm it starts on `http://localhost:8081`.

## 2. Test with Postman before touching the frontend

**Register**
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "name": "Test Patient",
  "email": "test@example.com",
  "mobileNumber": "9876543210",
  "password": "test123",
  "gender": "Male",
  "dateOfBirth": "2000-01-01",
  "age": 25,
  "bloodgroup": "O+",
  "city": "Mumbai",
  "state": "Maharashtra",
  "roleName": "Patient"
}
```

**Login**
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

Both return:
```json
{
  "token": "eyJhbGciOi...",
  "userId": 1,
  "name": "Test Patient",
  "email": "test@example.com",
  "role": "Patient"
}
```

Do NOT move to frontend integration until both endpoints work cleanly in Postman.

## 3. Frontend integration (React + Vite + Redux Toolkit)

### 3.1 Axios instance
`src/api/axiosInstance.js`
```js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081/api",
});

// attach JWT to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

### 3.2 Auth API calls
`src/api/authApi.js`
```js
import axiosInstance from "./axiosInstance";

export const registerUser = (data) => axiosInstance.post("/auth/register", data);
export const loginUser = (data) => axiosInstance.post("/auth/login", data);
```

### 3.3 Redux slice
`src/features/auth/authSlice.js`
```js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../api/authApi";

export const login = createAsyncThunk("auth/login", async (data, { rejectWithValue }) => {
  try {
    const res = await loginUser(data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await registerUser(data);
    localStorage.setItem("token", res.data.token);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Registration failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, status: "idle", error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = "loading"; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.token = action.payload.token;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

### 3.4 Wire into your existing login/register forms
Wherever your existing login form currently does a manual fetch or a placeholder submit handler, replace it with:
```js
import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";

const dispatch = useDispatch();

const handleLogin = async (e) => {
  e.preventDefault();
  const result = await dispatch(login({ email, password }));
  if (login.fulfilled.match(result)) {
    // redirect based on result.payload.role (Patient / Doctor / Admin)
    navigate("/dashboard");
  }
};
```

### 3.5 Protect routes
Any route that needs auth should check `token` from `localStorage` or Redux state and redirect to `/login` if missing — you'll extend this properly once Service 2 and 3 introduce role-based dashboards.

## 4. What "integration" means here — checklist

- [ ] Service 1 runs standalone and connects to MySQL (`spring.jpa.hibernate.ddl-auto=validate` will throw a startup error if your entity fields don't match the actual DB columns — fix mismatches here first)
- [ ] Register/Login verified in Postman
- [ ] Frontend axios points to `http://localhost:8081/api`
- [ ] Token stored in `localStorage` after login/register
- [ ] Token attached automatically via axios interceptor on future requests
- [ ] CORS confirmed working (check `app.cors.allowed-origins` matches your Vite dev server port — default assumed `5173`)

Once this is solid, Service 2 (Doctors/Hospitals/Availability CRUD) will reuse the exact same JWT — it just needs to validate it, not issue it.
