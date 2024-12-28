const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: null,
			user: null
		},
		actions: {
			login: async (email, password) => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/login", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						body: JSON.stringify({ email, password })
					});

					if (!resp.ok) {
						const errorData = await resp.json();
						throw new Error(errorData.message || "Login failed");
					}

					const data = await resp.json();
					setStore({ token: data.token });
					localStorage.setItem("token", data.token);
					return true;
				} catch (error) {
					console.error("Login error:", error.message);
					return false;
				}

			},

			createAccount: async (email, password) => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/register", {
						method: 'POST',
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ 
							email, 
							password 
						})
					});
			
					if (!resp.ok) {
						const errorData = await resp.json();
						throw new Error(errorData.msg || `HTTP error! status: ${resp.status}`);
					}
			
					const data = await resp.json();
					setStore({ token: data.token });
					localStorage.setItem('token', data.token);
					return true;
				} catch (error) {
					console.error("register error:", error.message);
					return { error: true, message: error.message };
				}
			},
			

			logout: () => {
				localStorage.removeItem('token');
				setStore({ token: null, user: null });
			},

			getUserData: async () => {
				const store = getStore();
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/private", {
						method: 'GET',
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						}
					});
					if (!resp.ok) {
						throw new Error(`HTTP error! status: ${resp.status}`);
					}
					const data = await resp.json();
					setStore({ user: data });
				} catch (error) {
					console.error("Error fetching user data:", error);
				}
			},
			






			// Use getActions to call a function within a fuction

		}
	};
};

export default getState;