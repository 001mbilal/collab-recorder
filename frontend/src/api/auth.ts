import { z } from "zod";

import api from "./axios";
import { AuthResponse, LoginFormData, RegisterFormData } from "../types";

const authResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export const authApi = {
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return authResponseSchema.parse(response.data);
  },

  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return authResponseSchema.parse(response.data);
  },
};
