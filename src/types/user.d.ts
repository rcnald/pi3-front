declare global {
  type User = {
    id: number;
    name: string;
    email: string;
  };

  type CreatedUser = User;

  type ProfileResponse = User;
}

export {};
