import { z } from "zod";

import api from "./axios";
import { RecordingsResponse } from "../types";

const recordingsResponseSchema = z.object({
  recordings: z.array(
    z.object({
      id: z.number(),
      user_id: z.number(),
      filepath: z.string(),
      created_at: z.string(),
    })
  ),
});

export const recordingsApi = {
  uploadRecording: async (file: Blob, _userId: number): Promise<void> => {
    const formData = new FormData();
    formData.append("recording", file, `recording-${Date.now()}.webm`);

    await api.post("/recordings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getUserRecordings: async (userId: number): Promise<RecordingsResponse> => {
    const response = await api.get(`/recordings/user/${userId}`);
    return recordingsResponseSchema.parse(response.data);
  },

  deleteRecording: async (recordingId: number): Promise<void> => {
    await api.delete(`/recordings/${recordingId}`);
  },
};
