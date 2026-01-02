export interface User {
  name: string;
  email: string;
  password?: string;
}

interface Base {
  id?: number;
  status?: number;
  createdOn?: string;
  updatedOn?: string;
}

export interface IUser extends Base {
  name: string;
  email: string;
  password: string;
  is_active?: boolean;
}

// interface ILoginFormInputs {
//   email: string;
//   password: string;
// }

// interface IRegisterFormInputs {
//     name: string;
//     email: string;
//     password: string;
// }
