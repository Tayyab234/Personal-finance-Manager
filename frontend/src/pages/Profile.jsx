import React, { useEffect, useState } from 'react';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data
    const mockUser = {
      name: "John Doe",
      email: "john@example.com",
    };
    setUser(mockUser);
  }, []);

  return (
    <div>
      <h1>Your Profile</h1>
      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default Profile;
